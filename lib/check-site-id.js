async function mergeSetting (req) {
  const { recordFind } = this.app.dobo
  const { get, find } = this.app.bajo.lib._

  const filter = { query: { siteId: req.site.id }, limit: 1 }
  let setting = (await recordFind('SumbaSiteSetting', filter))[0]
  if (!setting) {
    setting = {
      theme: get(this.app, 'waibuMpa.config.theme.default', false),
      iconset: get(this.app, 'waibuMpa.config.iconset.default', false)
    }
  }
  if (this.app.waibuMpa) {
    if (!setting.theme) throw this.error('Theme support is globally disabled!')
    const theme = find(this.app.waibuMpa.themes, { name: setting.theme })
    if (!theme) throw this.error('Theme \'%s\' is not installed', setting.theme)
    const iconset = find(this.app.waibuMpa.iconsets, { name: setting.iconset })
    if (!iconset) setting.iconset = false
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
