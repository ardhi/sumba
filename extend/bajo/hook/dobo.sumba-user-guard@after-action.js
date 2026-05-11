async function afterAction (action, ...args) {
  if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
  await this.getUserGuards(true)
}

export default afterAction
