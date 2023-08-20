export async function checker (repo, id, req) {
  const { importPkg, error } = this.bajo.helper
  const { recordFind } = this.bajoDb.helper
  const { get } = await importPkg('lodash-es')
  const { isSiteAware } = this.sumba.helper
  const siteId = get(req, 'site.id')
  if (siteId && await isSiteAware(repo)) {
    const filter = { query: { siteId, id }, limit: 1 }
    const rows = await recordFind(repo, filter)
    if (rows.length === 0) throw error('Record \'%s@%s\' not found!', id, repo, { statusCode: 404 })
  }
}

const bajoDbOnBeforeRecordGet = {
  level: 1000,
  handler: async function (repo, id, options) {
    await checker.call(this, repo, id, options.req)
  }
}

export default bajoDbOnBeforeRecordGet
