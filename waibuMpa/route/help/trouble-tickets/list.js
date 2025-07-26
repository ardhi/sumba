const model = 'SumbaTicket'

const list = {
  method: ['GET'],
  handler: async function (req, reply) {
    const { recordFind, getSchemaExt } = this.app.waibuDb
    const { getExcerpt } = this.app.bajoTemplate
    const { schema } = await getSchemaExt(model, 'list')
    const options = { count: true }
    const list = await recordFind({ model, req, options })
    schema.view.disabled = ['update', 'remove']
    schema.view.fields = ['createdAt', 'subject', 'status']
    schema.view.label = { subject: 'Your Message' }
    schema.view.formatter = {
      subject: (val, rec) => {
        return `<strong>${val}</strong><br />${getExcerpt(rec.message, 35)}`
      }
    }
    return await reply.view('sumba.template:/help/trouble-tickets/list.html', { list, schema })
  }
}

export default list
