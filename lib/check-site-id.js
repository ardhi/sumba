async function checkSiteId (ctx, req, reply) {
  if (!req.routerPath) return
  const { getConfig, error } = this.bajo.helper
  const { recordFind, recordGet } = this.bajoDb.helper
  const cfg = getConfig('sumba')
  if (!cfg.multiSite) {
    req.site = await recordGet('SumbaSite', 'DEFAULT')
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
  const rows = await recordFind('SumbaSite', filter)
  if (rows.length === 0) throw error('Unknown site or site is not configured yet')
  const row = rows[0]
  if (row.status !== 'ACTIVE') throw error('This site is currently inactive or disabled. Please contact your admin, thanks!')
  req.site = row
}

export default checkSiteId
