const bajoDbOnBeforeRecordCreate = {
  level: 1000,
  handler: async function (repo, body, options) {
    const { importPkg } = this.bajo.helper
    const { get } = await importPkg('lodash-es')
    const { isSiteAware } = this.sumba.helper
    const siteId = get(options, 'req.site.id')
    if (siteId && await isSiteAware(repo)) body.siteId = siteId
  }
}

export default bajoDbOnBeforeRecordCreate
