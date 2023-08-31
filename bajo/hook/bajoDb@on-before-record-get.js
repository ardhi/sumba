export async function checker (repo, id, req) {
  const { importPkg, error } = this.bajo.helper
  const { recordFind } = this.bajoDb.helper
  const { get } = await importPkg('lodash-es')
  const { hasColumn } = this.sumba.helper
  const item = { siteId: 'site.id', userId: 'user.id' }
  for (const i in item) {
    const rec = get(req, item[i])
    if (rec && await hasColumn(i, repo)) {
      const filter = { query: { id }, limit: 1 }
      filter.query[i] = rec
      const rows = await recordFind(repo, filter)
      if (rows.length === 0) throw error('Record \'%s@%s\' not found!', id, repo, { statusCode: 404 })
    }
  }
}

const bajoDbOnBeforeRecordGet = {
  level: 1000,
  handler: async function (repo, id, options) {
    await checker.call(this, repo, id, options.req)
  }
}

export default bajoDbOnBeforeRecordGet
