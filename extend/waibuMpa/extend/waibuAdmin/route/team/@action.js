const action = {
  method: ['GET', 'POST'],
  title: 'teamProfile',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const crudSkel = await importModule('waibuAdmin:/lib/crud-skel.js')
    return await crudSkel.call(this, 'SumbaTeam', req, reply)
  }
}

export default action
