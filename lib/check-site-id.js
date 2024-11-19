async function mergeSetting (req) {
  const { omit } = this.app.bajo.lib._
  const { getPlugin, pascalCase } = this.app.bajo
  const { recordFind } = this.app.dobo
  const setting = {}
  for (const name of this.app.bajo.pluginNames) {
    const plugin = getPlugin(name)
    const model = pascalCase(`${plugin.alias} site setting`)
    let items = []
    try {
      items = await recordFind(model, { query: { siteId: req.site.id }, limit: 1 })
    } catch {}
    if (items.length > 0) setting[name] = omit(items[0], ['updatedAt', 'siteId', 'id'])
  }
  req.site.setting = setting
}

const picked = ['id', 'hostname', 'alias', 'title', 'email']
async function checkSiteId (req, reply) {
  const { pick } = this.app.bajo.lib._
  const { recordFind } = this.app.dobo

  if (!this.config.multiSite) {
    const resp = await recordFind('SumbaSite', { query: { alias: 'default' } }, { noHook: true })
    req.site = pick(resp[0], picked)
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
  const row = pick(rows[0], picked)
  if (row.status !== 'ACTIVE') throw this.error('This site is currently inactive or disabled. Please contact your admin, thanks!')
  req.site = row
  await mergeSetting.call(this, req)
}

export default checkSiteId
