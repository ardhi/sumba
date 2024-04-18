export async function checker (coll, id, req) {
  const { importPkg, error } = this.bajo.helper
  const { recordFind } = this.bajoDb.helper
  const { get } = this.bajo.helper._
  const { hasColumn } = this.sumba.helper
  const item = { siteId: 'site.id', userId: 'user.id' }
  for (const i in item) {
    const rec = get(req, item[i])
    if (rec && await hasColumn(i, coll)) {
      const filter = { query: { id }, limit: 1 }
      filter.query[i] = rec
      const rows = await recordFind(coll, filter)
      if (rows.length === 0) throw error('Record \'%s@%s\' not found!', id, coll, { statusCode: 404 })
    }
  }
}

const bajoDbOnBeforeRecordGet = {
  level: 1000,
  handler: async function (coll, id, options) {
    await checker.call(this, coll, id, options.req)
  }
}

export default bajoDbOnBeforeRecordGet
