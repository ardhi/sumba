async function hasColumn (name, model) {
  const { getInfo } = this.app.dobo
  const { find } = this.app.bajo.lib._
  const { schema } = getInfo(model)

  const result = find(schema.properties, { name })
  return !!result
}

export default hasColumn
