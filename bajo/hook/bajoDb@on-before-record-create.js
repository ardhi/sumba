const bajoDbOnBeforeRecordCreate = {
  level: 1000,
  handler: async function (coll, body, options) {
    const { importPkg } = this.bajo.helper
    const { get } = this.bajo.helper._
    const { hasColumn } = this.sumba.helper
    const item = { siteId: 'req.site.id', userId: 'req.user.id' }
    for (const i in item) {
      const rec = get(options, item[i])
      if (rec && await hasColumn(i, coll)) body[i] = rec
    }
  }
}

export default bajoDbOnBeforeRecordCreate
