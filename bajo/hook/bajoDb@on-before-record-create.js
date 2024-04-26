const bajoDbOnBeforeRecordCreate = {
  level: 1000,
  handler: async function (coll, body, options) {
    const { get } = this.bajo.helper._
    const { hasColumn } = this.sumba.helper
    if (options.noAutoFilter) return
    const item = { siteId: 'site.id', userId: 'user.id' }
    for (const i in item) {
      const rec = get(options.req, item[i])
      if (rec && await hasColumn(i, coll)) body[i] = rec
    }
  }
}

export default bajoDbOnBeforeRecordCreate
