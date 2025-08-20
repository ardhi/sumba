const model = 'SumbaTicket'

const add = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.lib.aneka
    const { recordCreate, recordFind } = this.app.waibuDb
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
    return await reply.view('sumba.template:/help/trouble-tickets/add.html', { form, error, cats })
  }
}

export default add
