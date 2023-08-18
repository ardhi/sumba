const onRequest = {
  level: 10,
  handler: async function (ctx, req, reply) {
    const { getConfig, error } = this.bajo.helper
    const { recordFind } = this.bajoDb.helper
    const cfg = getConfig('sumba')
    if (!cfg.multiSite) return
    const hostname = req.hostname.split(':')[0]
    const filter = { query: `hostname:${hostname},alias:${hostname}` }
    const rows = await recordFind('SumbaSite', filter)
    if (rows.length === 0) throw error('Unknown site or site is not configured yet')
    const row = rows[0]
    if (row.status !== 'ACTIVE') throw error('This site is currently inactive or disabled. Please contact your admin, thanks!')
    req.siteId = row.id
  }
}

export default onRequest
