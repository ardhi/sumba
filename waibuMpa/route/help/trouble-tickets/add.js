const model = 'SumbaTicket'

const add = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { recordCreate, recordFind } = this.app.waibuDb
    const { defaultsDeep } = this.app.bajo.lib._
    const options = {}
    const form = defaultsDeep(req.body, {})
    let error
    if (req.method === 'POST') {
      try {
        await recordCreate({ model, req, reply, options })
        return reply.redirectTo('sumba:/help/trouble-tickets/list')
      } catch (err) {
        error = err
      }
    }
    const cats = await recordFind({ model: 'SumbaTicketCat', req, options: { sort: 'level:1+name:1', limit: -1, dataOnly: true } })
    return reply.view('sumba.template:/help/trouble-tickets/add.html', { form, error, cats })
  }
}

export default add
