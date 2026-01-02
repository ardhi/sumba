const manageSite = {
  method: ['GET', 'POST'],
  title: 'manageSite',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const detailsHandler = await importModule('waibuDb:/lib/crud/details-handler.js')
    const editHandler = await importModule('waibuDb:/lib/crud/edit-handler.js')
    const action = req.query.edit ? editHandler : detailsHandler
    const template = `waibuDb.template:/crud/${req.query.edit ? 'edit' : 'details'}.html`
    const model = 'SumbaSite'
    req.params.id = req.site.id
    req.params.base = ''
    return await action.call(this, { req, reply, model, template })
  }
}

export default manageSite
