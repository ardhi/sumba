async function afterTransaction (action, ...args) {
  if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
  await this.getAttribGuards(true)
}

export default afterTransaction
