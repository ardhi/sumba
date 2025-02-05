async function mergeSetting (req) {
  const { trim } = this.app.bajo.lib._
  const { recordFind } = this.app.dobo
  const setting = {}
  const query = {
    ns: { $in: this.app.bajo.pluginNames },
    siteId: req.site.id
  }
  const items = await recordFind('SumbaSiteSetting', { query, limit: 200 })
  for (const item of items) {
    setting[item.ns] = setting[item.ns] ?? {}
    let value = trim([item.value] ?? '')
    if (['[', '{'].includes(value[0])) value = JSON.parse(value)
    else if (Number(value)) value = Number(value)
    else if (['true', 'false'].includes(value)) value = value === 'true'
    setting[item.ns][item.key] = value
  }
  req.site.setting = setting
}

const omitted = ['status']
async function checkSiteId (req, reply) {
  const { omit } = this.app.bajo.lib._
  const { recordFind } = this.app.dobo

  if (!this.config.multiSite) {
    const resp = await recordFind('SumbaSite', { query: { alias: 'default' } }, { noHook: true })
    req.site = omit(resp[0], omitted)
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
  const row = omit(rows[0], omitted)
  if (row.status !== 'ACTIVE') throw this.error('This site is currently inactive or disabled. Please contact your admin, thanks!')
  req.site = row
  await mergeSetting.call(this, req)
}

export default checkSiteId
