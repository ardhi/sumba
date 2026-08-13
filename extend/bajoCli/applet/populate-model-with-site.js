async function populateModelWithSite (path, ...args) {
  const { getModel } = this.app.dobo
  const { importPkg } = this.app.bajo
  const { isArray } = this.app.lib._
  const confirm = await importPkg('bajoCli:@inquirer/confirm')
  let [modelName, alias] = args
  if (!modelName) this.print.fatal('modelRequired')
  if (!alias) this.print.fatal('aliasRequired')
  const model = getModel(modelName, true)
  if (!model) this.print.fatal('modelNotFound%s', modelName)
  if (!model.hasProperty('siteId')) this.print.fatal('noSiteIdProperty%s', modelName)
  const answer = await confirm({ message: this.print.buildText('aboutToRebuildModelWithSite%s%s', modelName, alias), default: false })
  if (!answer) {
    this.print.fail('aborted')
    this.app.exit()
  }
  if (alias.includes(',')) alias = alias.split(',').map(item => item.trim())
  await this.app.dobo.start()
  try {
    const fixtures = await model.loadFixtures({ ignoreError: false, collectItems: true })
    const siteModel = getModel('SumbaSite')
    let sites = []
    if (['all', '*'].includes(alias)) {
      sites = await siteModel.findAllRecord({}, { dataOnly: true, fields: ['id', 'hostname'] })
    } else {
      if (!isArray(alias)) alias = [alias]
      sites = await siteModel.findAllRecord({ query: { alias: { $in: alias } } }, { dataOnly: true, fields: ['id', 'hostname'] })
    }
    await model.transaction(async (trx) => {
      for (const site of sites) {
        for (const fixture of fixtures) {
          const siteId = site.id + ''
          fixture.siteId = siteId
          const results = await model.findAllRecord({ query: { siteId, code: fixture.code } }, { fields: ['id'], trx })
          for (const rec of results) {
            await model.removeRecord(rec.id, { noCache: true, noResult: true, trx, throwNotFound: false })
          }
          await model.createRecord(fixture, { noCache: true, noResult: true, trx })
        }
        this.print.info('modelPopulated%s%s', site.hostname, fixtures.length)
      }
    })
  } catch (err) {
    this.print.fatal(err)
  }
  this.app.exit()
}

export default populateModelWithSite
