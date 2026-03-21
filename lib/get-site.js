import { parseNsSettings } from './util.js'

async function getSite (req) {
  const { runHook } = this.app.bajo
  const { omit, isPlainObject } = this.app.lib._
  const { getHostname } = this.app.waibu
  const omitted = ['status']

  await runHook(`${this.ns}:beforeGetSite`, req)
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
    await runHook(`${this.ns}:afterGetSite`, req, site)
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
  if (!isPlainObject(req)) query = { id: req }
  else query = { hostname: getHostname(req) }
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
