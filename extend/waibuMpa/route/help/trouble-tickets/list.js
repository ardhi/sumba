const model = 'SumbaTicket'

const list = {
  method: ['GET'],
  handler: async function (req, reply) {
    const { findRecord, getSchemaExt } = this.app.waibuDb
    const { createExcerpt } = this.app.lib.aneka
    const { schema } = await getSchemaExt(model, 'list')
    const options = { count: true, fmt: true }
    const list = await findRecord({ model, req, options })
    schema.view.disabled = ['update', 'remove']
    schema.view.fields = ['createdAt', 'message', 'status']
    schema.view.label = { message: 'Your Message' }
    schema.view.noEscape = ['message']
    schema.view.format = {
      message: (val, rec) => {
        return `<h6>${val}</h6>${createExcerpt({ content: rec.message, maxWords: 35 })}`
      }
    }
    return await reply.view('sumba.template:/help/trouble-tickets/list.html', { list, schema })
  }
}

export default list
