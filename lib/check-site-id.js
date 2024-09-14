async function mergeSetting (req) {
  const { recordFind } = this.app.dobo
  const { get } = this.app.bajo.lib._

  const filter = { query: { siteId: req.site.id }, limit: 1 }
  let setting = (await recordFind('SumbaSiteSetting', filter))[0]
  if (!setting) {
    setting = {
      theme: get(this.app, 'waibuMpa.config.theme.default'),
      iconset: get(this.app, 'waibuMpa.config.iconset.default')
    }
  }
  req.site.setting = setting
}

async function checkSiteId (req, reply) {
  const { recordFind, recordGet } = this.app.dobo

  if (!this.config.multiSite) {
    const resp = await recordFind('SumbaSite', { query: { alias: 'default' } }, { noHook: true })
    req.site = resp[0]
    await mergeSetting.call(this, req)
    return
  }
  const hostname = req.hostname.split(':')[0]
  const query = {
    $or: [
      { hostname },
      { alias: hostname }
    ]
  }
  const filter = { query }
  const rows = await recordFind('SumbaSite', filter, { noHook: true })
  if (rows.length === 0) throw this.error('Unknown site or site is not configured yet')
  const row = rows[0]
  if (row.status !== 'ACTIVE') throw this.error('This site is currently inactive or disabled. Please contact your admin, thanks!')
  const country = await recordGet('CdbCountry', row.country, { noHook: true })
  row.countryName = country.name
  req.site = row
  await mergeSetting.call(this, req)
}

export default checkSiteId
