const model = 'SumbaTicketDetail'

const id = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { cloneDeep } = this.lib._
    const { recordCreate, recordFind, getSchemaExt } = this.app.waibuDb
    const { schema } = await getSchemaExt(model, 'list')

    const master = (await recordFind({ model: 'SumbaTicket', req, options: { dataOnly: true, query: { id: req.params.id }, limit: 1 } }))[0]
    if (!master) throw this.error('_notFound')
    const form = cloneDeep(req.body)
    let error
    if (req.method === 'POST') {
      try {
        form.masterId = master.id + ''
        await recordCreate({ model: 'SumbaTicketDetail', req, body: form })
        return reply.redirectTo('sumba:/help/trouble-tickets/list')
      } catch (err) {
        error = err
      }
    }
    const query = { masterId: req.params.id + '' }
    const options = { count: true, query }
    const list = await recordFind({ model, req, options })
    schema.view.disabled = ['update', 'remove']
    schema.view.fields = ['createdAt']
    schema.view.label = { createdAt: 'conversation' }
    schema.view.formatter = {
      createdAt: async function (val, rec) {
        const message = this.app.bajoMarkdown ? this.app.bajoMarkdown.parseContent(rec.message) : rec.message
        const isMe = rec.userId === req.user.id
        const sentence = `<c:div margin="bottom-3"><c:badge background="color:${isMe ? 'primary' : 'secondary'}" t:content="${isMe ? 'you' : 'us'}" /> <small>${req.format(val, 'datetime')}</small></c:div>`
        return (await this.component.buildSentence(sentence)) + message
      }
    }
    return await reply.view('sumba.template:/help/trouble-tickets/details.html', { list, schema, master, form, error })
  }
}

export default id
