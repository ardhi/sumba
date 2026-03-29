const action = {
  method: ['GET', 'POST'],
  title: 'manageAllSite',
  interSite: true,
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const crudSkel = await importModule('waibuAdmin:/lib/crud-skel.js')
    return await crudSkel.call(this, 'SumbaSite', req, reply)
  }
}

export default action
