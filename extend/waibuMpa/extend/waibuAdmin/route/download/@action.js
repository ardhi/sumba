const action = {
  method: ['GET', 'POST'],
  title: 'manageDownload',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const crudSkel = await importModule('waibuAdmin:/lib/crud-skel.js')
    return await crudSkel.call(this, 'SumbaDownload', req, reply)
  }
}

export default action
