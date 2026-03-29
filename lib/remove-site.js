export async function removeRefs (site, options, verbose) {
  const { orderBy } = this.app.lib._
  const { getModel } = this.app.dobo
  const models = orderBy(this.app.dobo.models, ['buildLevel'], ['desc']).filter(m => {
    const prop = m.properties.find(p => p.name === 'siteId')
    return !!prop
  }).map(m => m.name)
  for (const m of models) {
    const mdl = getModel(m)
    const rows = await mdl.findAllRecord({ query: { siteId: site.id } }, { ...options, dataOnly: true })
    const ids = rows.map(item => item.id)
    // TODO: backup
    if (ids.length === 0) continue
    for (const id of ids) {
      await mdl.removeRecord(id, { noReturn: true, ...options })
    }
    if (verbose) this.print.succeed('removedFrom%s%s', mdl.name, ids.length)
  }
}

async function removeSite (alias, verbose) {
  const { isEmpty } = this.app.lib._
  const { getModel } = this.app.dobo

  if (isEmpty(alias)) throw this.error('aliasRequired%s', alias)
  const model = getModel('SumbaSite')
  const query = { alias }
  const site = await model.findOneRecord({ query })
  if (isEmpty(site)) throw this.error('aliasNotFound%s', alias)
  await model.transaction(async (trx) => {
    const options = { trx, noHook: true }
    await removeRefs.call(this, site, options, verbose)
    await model.removeRecord(site.id, { noReturn: true, trx, noHook: true })
    if (verbose) this.print.succeed('removedFrom%s%s', model.name, 1)
  })
  if (verbose) this.print.info('done')
}

export default removeSite
