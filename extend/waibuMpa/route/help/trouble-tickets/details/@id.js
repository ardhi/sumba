const model = 'SumbaTicketDetail'

const id = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { cloneDeep } = this.app.lib._
    const { createRecord, findOneRecord, findRecord, getSchemaExt } = this.app.waibuDb
    const { schema } = await getSchemaExt(model, 'list')

    const master = await findOneRecord({ model: 'SumbaTicket', req, options: { dataOnly: true, query: { id: req.params.id } } })
    if (!master) throw this.error('_notFound')
    const form = cloneDeep(req.body)
    let error
    if (req.method === 'POST') {
      try {
        form.masterId = master.id + ''
        await createRecord({ model: 'SumbaTicketDetail', req, body: form })
        return reply.redirectTo('sumba:/help/trouble-tickets/list')
      } catch (err) {
        error = err
      }
    }
    const query = { masterId: req.params.id + '' }
    const options = { count: true, query }
    const list = await findRecord({ model, req, options })
    schema.view.disabled = ['update', 'remove', 'get']
    schema.view.fields = ['message']
    schema.view.label = { message: 'conversation' }
    schema.view.noEscape = ['message']
    schema.view.format = {
      message: async function (val, rec) {
        const message = this.app.bajoMarkdown ? this.app.bajoMarkdown.parse(rec.message) : rec.message
        const isMe = rec.userId === req.user.id + ''
        const sentence = `<c:div margin="bottom-3"><c:badge background="color:${isMe ? 'primary' : 'secondary'}" t:content="${isMe ? 'you' : 'us'}" /> <small>${req.format(rec.createdAt, 'datetime')}</small></c:div>`
        return (await this.component.buildSentence(sentence)) + message
      }
    }
    return await reply.view('sumba.template:/help/trouble-tickets/details.html', { list, schema, master, form, error })
  }
}

export default id
