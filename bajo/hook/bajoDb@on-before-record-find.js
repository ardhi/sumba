const bajoDbOnBeforeRecordFind = {
  level: 1000,
  handler: async function (repo, filter, options) {
    const { importPkg } = this.bajo.helper
    const { isEmpty, cloneDeep, get } = await importPkg('lodash-es')
    const { isSiteAware } = this.sumba.helper
    const siteId = get(options, 'req.site.id')
    if (siteId && await isSiteAware(repo)) {
      filter.query = filter.query || {}
      const old = cloneDeep(filter.query.$or)
      if (old) {
        filter.query = { $and: [old] }
        filter.query.$and.push({ siteId })
      } else filter.query.siteId = siteId
      if (isEmpty(filter.query)) filter.query = undefined
    }
  }
}

export default bajoDbOnBeforeRecordFind
