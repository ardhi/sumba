const action = {
  method: ['GET', 'POST'],
  title: 'Site Manager',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const handler = await importModule('waibuDb:/lib/crud/all-handler.js')
    const model = 'SumbaSite'
    const { action } = req.params
    const template = `waibuAdmin.template:/crud/${action}.html`
    const params = { page: { layout: `waibuAdmin.layout:/crud/${action === 'list' ? 'wide' : 'default'}.html` } }
    return handler.call(this, { model, req, reply, action, params, template })
  }
}

export default action
