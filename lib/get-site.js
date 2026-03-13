async function getSite (hostname, useId) {
  const { omit } = this.app.lib._
  const omitted = ['status']

  const mergeSetting = async (site) => {
    const { defaultsDeep, isSet } = this.app.lib.aneka
    const { parseObject, dayjs } = this.app.lib
    const { isEmpty, trim, get, filter, set, isPlainObject, isArray } = this.app.lib._
    const defSetting = {}
    const nsSetting = {}
    const names = this.app.getAllNs()
    const query = {
      ns: { $in: names },
      siteId: site.id
    }
    const all = await this.app.dobo.getModel('SumbaSiteSetting').findAllRecord({ query })
    for (const ns of names) {
      const item = get(this, `app.${ns}.config.siteSetting`)
      if (isSet(item)) defSetting[ns] = item
      const items = filter(all, { ns })
      for (const item of items) {
        let value = trim([item.value] ?? '')
        if (['[', '{'].includes(value[0])) {
          try {
            value = parseObject(JSON.parse(value))
          } catch (err) {}
        } else if (Number(value)) value = Number(value)
        else if (['true', 'false'].includes(value)) value = value === 'true'
        else if (item.key.endsWith('$in')) value = value.split(',').map(v => v.trim())
        else {
          const dt = dayjs(value)
          if (dt.isValid()) value = dt.toDate()
        }
        if ((isPlainObject(value) || isArray(value)) && isEmpty(value)) continue
        set(nsSetting, `${ns}.${item.key}`, value)
      }
    }
    site.setting = defaultsDeep({}, nsSetting, defSetting)
    // additional fields
    const country = await this.app.dobo.getModel('CdbCountry').getRecord(site.country, { noHook: true })
    site.countryName = (country ?? {}).name ?? site.country
  }

  let site = {}

  const multiSite = this.config.multiSite === true ? { enabled: true, catchAll: 'default' } : this.config.multiSite
  if (!multiSite.enabled) {
    const resp = await this.app.dobo.getModel('SumbaSite').findOneRecord({ query: { alias: 'default' } }, { noHook: true })
    site = omit(resp, omitted)
    await mergeSetting(site)
    return site
  }
  let query
  if (useId) query = { id: hostname }
  else query = { hostname }
  let row = await this.app.dobo.getModel('SumbaSite').findOneRecord({ query }, { noHook: true })
  if (!row) {
    if (multiSite.catchAll) {
      query = { alias: multiSite.catchAll === true ? 'default' : multiSite.catchAll }
      row = await this.app.dobo.getModel('SumbaSite').findOneRecord({ query }, { noHook: true })
    }
    if (!row) throw this.error('unknownSite')
  }
  if (row.status !== 'ACTIVE') throw this.error('siteInactiveInfo')
  site = omit(row, omitted)
  await mergeSetting(site)
  return site
}

export default getSite
