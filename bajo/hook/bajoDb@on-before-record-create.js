const bajoDbOnBeforeRecordCreate = {
  level: 1000,
  handler: async function (repo, body, options) {
    const { importPkg } = this.bajo.helper
    const { get } = await importPkg('lodash-es')
    const { hasColumn } = this.sumba.helper
    const item = { siteId: 'req.site.id', userId: 'req.user.id' }
    for (const i in item) {
      const rec = get(options, item[i])
      if (rec && await hasColumn(i, repo)) body[i] = rec
    }
  }
}

export default bajoDbOnBeforeRecordCreate
