const bajoDbOnBeforeRecordFind = {
  level: 1000,
  handler: async function (coll, filter, options) {
    const { importPkg } = this.bajo.helper
    const { isEmpty, cloneDeep, get, set } = await importPkg('lodash-es')
    const { hasColumn } = this.sumba.helper
    const item = { siteId: 'req.site.id', userId: 'req.user.id' }
    for (const i in item) {
      const rec = get(options, item[i])
      if (rec && await hasColumn(i, coll)) {
        filter.query = filter.query ?? {}
        const old = cloneDeep(filter.query.$or)
        if (old) {
          filter.query = { $and: [old] }
          filter.query.$and.push(set({}, i, rec))
        } else filter.query[i] = rec
        if (isEmpty(filter.query)) filter.query = undefined
      }
    }
  }
}

export default bajoDbOnBeforeRecordFind
