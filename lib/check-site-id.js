async function mergeSetting (req) {
  const { defaultsDeep } = this.app.bajo
  const { trim, get, filter } = this.app.bajo.lib._
  const { recordFind } = this.app.dobo
  const defSetting = {}
  const nsSetting = {}
  const query = {
    ns: { $in: this.app.bajo.pluginNames },
    siteId: req.site.id
  }
  const all = await recordFind('SumbaSiteSetting', { query, limit: -1 })
  for (const ns of this.app.bajo.pluginNames) {
    nsSetting[ns] = {}
    defSetting[ns] = get(this, `app.${ns}.config.siteSetting`, {})
    const items = filter(all, { ns })
    for (const item of items) {
      let value = trim([item.value] ?? '')
      if (['[', '{'].includes(value[0])) value = JSON.parse(value)
      else if (Number(value)) value = Number(value)
      else if (['true', 'false'].includes(value)) value = value === 'true'
      nsSetting[ns][item.key] = value
    }
  }
  req.site.setting = defaultsDeep({}, nsSetting, defSetting)
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
