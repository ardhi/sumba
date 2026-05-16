async function afterTransaction (action, ...args) {
  if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
  await this.getRouteGuards(true)
}

export default afterTransaction
