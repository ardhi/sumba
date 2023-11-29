async function mergeSetting (req) {
  const { getConfig } = this.bajo.helper
  const { recordFind } = this.bajoDb.helper
  const filter = { query: { siteId: req.site.id }, limit: 1 }
  const settings = await recordFind('SumbaSiteSetting', filter)
  req.site.setting = settings[0] ?? { theme: getConfig('bajoWebMpa').theme ?? '' }
}

async function checkSiteId (req, reply) {
  const { getConfig, error } = this.bajo.helper
  const { recordFind, recordGet } = this.bajoDb.helper
  const cfg = getConfig('sumba')
  if (!cfg.multiSite) {
    const resp = await recordFind('SumbaSite', { query: { alias: 'default' } }, { skipHook: true })
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
  const rows = await recordFind('SumbaSite', filter, { skipHook: true })
  if (rows.length === 0) throw error('Unknown site or site is not configured yet')
  const row = rows[0]
  if (row.status !== 'ACTIVE') throw error('This site is currently inactive or disabled. Please contact your admin, thanks!')
  const country = await recordGet('CdbCountry', row.country, { skipHook: true })
  row.countryName = country.name
  req.site = row
  await mergeSetting.call(this, req)
}

export default checkSiteId
