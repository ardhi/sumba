import { parseNsSettings } from './util.js'

async function getSite (input, byId = false) {
  const { omit } = this.app.lib._
  const { set: setCache, get: getCache } = this.app.bajoCache ?? {}
  const omitted = ['status']

  let site = {}
  const mergeSetting = async (site) => {
    const { defaultsDeep, isSet } = this.app.lib.aneka
    const { get, filter } = this.app.lib._
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
      parseNsSettings.call(this, ns, nsSetting, items)
    }
    site.setting = defaultsDeep({}, nsSetting, defSetting)
    // additional fields
    const country = await this.app.dobo.getModel('CdbCountry').getRecord(site.country, { noHook: true })
    site.countryName = (country ?? {}).name ?? site.country
  }

  if (!this.config.multiSite.enabled) {
    const filter = { query: { alias: 'default' } }
    const key = 'getSite|default'
    if (getCache) {
      site = await getCache({ key })
      if (site) return site
    }
    const resp = await this.app.dobo.getModel('SumbaSite').findOneRecord(filter, { noHook: true })
    site = omit(resp, omitted)
    await mergeSetting(site)
    if (setCache) {
      await setCache({ key, value: site, ttl: this.config.cacheTtl.getSiteDur })
    }
    return site
  }
  let query
  if (byId) query = { id: input }
  else query = { hostname: input }
  const key = `getSite|multiSite|${input}`
  if (getCache) {
    site = await getCache({ key })
    if (site) return JSON.parse(site)
  }
  let row = await this.app.dobo.getModel('SumbaSite').findOneRecord({ query }, { noHook: true })
  if (!row) {
    if (this.config.multiSite.catchAll) {
      query = { alias: this.config.multiSite.catchAll === true ? 'default' : this.config.multiSite.catchAll }
      row = await this.app.dobo.getModel('SumbaSite').findOneRecord({ query }, { noHook: true })
    }
    if (!row) throw this.error('unknownSite')
  }
  if (row.status !== 'ACTIVE') throw this.error('siteInactiveInfo')
  site = omit(row, omitted)
  await mergeSetting(site)
  if (setCache) {
    await setCache({ key, value: JSON.stringify(site), ttl: this.config.cacheTtl.getSiteDur })
  }
  return site
}

export default getSite
