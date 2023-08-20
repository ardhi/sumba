async function isSiteAware (repo) {
  const { importPkg } = this.bajo.helper
  const { getInfo } = this.bajoDb.helper
  const { find } = await importPkg('lodash-es')
  const { schema } = await getInfo(repo)
  const siteId = find(schema.properties, { name: 'siteId' })
  return !!siteId
}

export default isSiteAware
