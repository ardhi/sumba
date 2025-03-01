async function mergeSetting (req) {
  const { defaultsDeep, parseObject } = this.app.bajo
  const { trim, get, filter } = this.app.bajo.lib._
  const { recordFind, recordGet } = this.app.dobo
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
  req.site.setting = parseObject(defaultsDeep({}, nsSetting, defSetting))
  // additional fields
  const country = await recordGet('CdbCountry', req.site.country, { noHook: true })
  req.site.countryName = (country ?? {}).name ?? req.site.country
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
  const filter = { query, limit: 1 }
  const rows = await recordFind('SumbaSite', filter, { noHook: true })
  if (rows.length === 0) throw this.error('unknownSite')
  const row = omit(rows[0], omitted)
  if (row.status !== 'ACTIVE') throw this.error('siteInactiveInfo')
  await mergeSetting.call(this, req)
}

export default checkSiteId
