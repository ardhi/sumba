import path from 'path'

export async function getAllFixtures (alias) {
  const { getPluginDataDir, readConfig } = this.app.bajo
  const { isEmpty, omit, kebabCase, isString } = this.app.lib._
  const { getModel } = this.app.dobo
  const { fastGlob } = this.app.lib
  const data = {}

  function replaceAlias (alias, items) {
    for (const item of items) {
      for (const key in item) {
        const val = item[key]
        if (isString(val)) item[key] = val.replaceAll('{alias}', alias)
      }
    }
  }

  const formats = this.app.configHandlers.map(item => item.ext.slice(1))
  const overrideBase = `${getPluginDataDir('sumba')}/create-new-site-fixtures/${alias}`
  const models = this.app.dobo.models.filter(m => {
    const prop = m.properties.find(p => p.name === 'siteId')
    return !!prop
  }).map(m => m.name)
  models.unshift('SumbaSite')
  const files = (await fastGlob(`${overrideBase}/*.{${formats.join(',')}}`)).map(file => {
    const ext = path.extname(file)
    return file.slice(0, file.length - ext.length)
  })
  for (const m of models) {
    const model = getModel(m)
    const file = `${overrideBase}/${kebabCase(m)}`
    let fixtures = (await model.loadFixtures({ collectItems: true, noLookup: true })) ?? []
    if (files.includes(file)) {
      const items = await readConfig(file, { ignoreError: true, defValue: [] })
      if (!isEmpty(items)) fixtures = items
    }
    if (!Array.isArray(fixtures)) fixtures = [fixtures]
    if (fixtures.length === 0) continue
    replaceAlias(alias, fixtures)
    if (isEmpty(alias)) throw this.error('aliasRequired%s', alias)
    const omitted = ['_attachments', 'siteId']
    for (const item of ['createdAt', 'updatedAt', 'immutable']) {
      const props = model.properties.filter(prop => prop.feature === ('dobo:' + item)).map(prop => prop.name)
      if (props.length > 0) omitted.push(...props)
    }
    for (const idx in fixtures) {
      fixtures[idx] = omit(fixtures[idx], omitted)
    }
    data[m] = m === 'SumbaSite' ? fixtures[0] : fixtures
  }
  return data
}

export async function createRefs (site, data, options, verbose) {
  const { isString } = this.app.lib._
  const { getModel } = this.app.dobo
  for (const m in data) {
    if (m === 'SumbaSite') continue
    const mdl = getModel(m)
    const fixtures = data[m]
    for (const f of fixtures) {
      f.siteId = site.id
      for (const key in f) {
        const val = f[key]
        if (isString(val) && val.slice(0, 2) === '?:') f[key] = await mdl._simpleLookup(val.slice(2), options)
      }
      await mdl.createRecord(f, options)
    }
    if (verbose) this.print.succeed('writingModel%s%s', mdl.name, fixtures.length)
  }
}

async function createNewSite (alias, hostname, verbose) {
  const { isEmpty } = this.app.lib._
  const { getModel } = this.app.dobo

  if (isEmpty(alias)) throw this.error('aliasRequired%s', alias)
  let spin
  if (verbose) spin = this.print.spinner().start('processing...')
  const query = { $or: [{ alias }] }
  if (!isEmpty(hostname)) query.$or.push({ hostname })
  const model = getModel('SumbaSite')
  const site = await model.findOneRecord({ query })
  if (!isEmpty(site)) {
    if (verbose) spin.stop()
    throw this.error('aliasOrHOstnameExists%s%s', alias, hostname ?? '')
  }
  // lets go
  const fixtures = await getAllFixtures.call(this, alias)
  if (verbose) spin.stop()
  fixtures.SumbaSite.alias = alias
  if (!isEmpty(hostname)) fixtures.SumbaSite.hostname = hostname
  await model.transaction(async (trx) => {
    const newSite = await model.createRecord(fixtures.SumbaSite, { trx, noHook: true })
    if (verbose) this.print.succeed('writingModel%s%s', model.name, 1)
    const options = { trx }
    await createRefs.call(this, newSite, fixtures, options, verbose)
  })
  if (verbose) this.print.info('done')
}

export default createNewSite
