const action = {
  method: ['GET', 'POST'],
  title: 'siteSetting',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const crudSkel = await importModule('waibuAdmin:/lib/crud-skel.js')
    return await crudSkel.call(this, 'SumbaSiteSetting', req, reply)
  }
}

export default action
