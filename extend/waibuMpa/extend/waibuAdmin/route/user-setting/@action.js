const action = {
  method: ['GET', 'POST'],
  title: 'manageUserSetting',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const crudSkel = await importModule('waibuAdmin:/lib/crud-skel.js')
    return await crudSkel.call(this, 'SumbaUserSetting', req, reply)
  }
}

export default action
