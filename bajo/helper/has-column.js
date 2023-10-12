async function hasColumn (name, coll) {
  const { importPkg } = this.bajo.helper
  const { getInfo } = this.bajoDb.helper
  const { find } = await importPkg('lodash-es')
  const { schema } = await getInfo(coll)
  const result = find(schema.properties, { name })
  return !!result
}

export default hasColumn
