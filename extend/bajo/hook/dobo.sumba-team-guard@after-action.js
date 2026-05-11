async function afterAction (action, ...args) {
  if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
  await this.getTeamGuards(true)
}

export default afterAction
