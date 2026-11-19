const model = 'SumbaTicket'

const list = {
  method: ['GET'],
  handler: async function (req, reply) {
    const { findRecord, getSchemaExt } = this.app.waibuDb
    const { createExcerpt } = this.app.lib.aneka
    const { schema } = await getSchemaExt(model, 'list')
    const options = { count: true }
    const list = await findRecord({ model, req, options })
    schema.view.disabled = ['update', 'remove']
    schema.view.fields = ['createdAt', 'subject', 'status']
    schema.view.label = { subject: 'Your Message' }
    schema.view.format = {
      subject: (val, rec) => {
        return `<strong>${val}</strong><br />${createExcerpt({ content: rec.message, maxWords: 35 })}`
      }
    }
    return await reply.view('sumba.template:/help/trouble-tickets/list.html', { list, schema })
  }
}

export default list
