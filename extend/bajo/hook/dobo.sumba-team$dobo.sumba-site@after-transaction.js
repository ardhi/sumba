async function afterTransaction (action, ...args) {
  if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
  await this.getRouteGuards(true)
  await this.getModelGuards(true)
  await this.getAttribGuards(true)
}

export default afterTransaction
