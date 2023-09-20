const profile = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { defaultsDeep } = this.bajo.helper
    const { recordUpdate } = this.bajoWeb.helper
    let form = defaultsDeep(req.body, req.user)
    if (req.method === 'POST') {
      try {
        form = (await recordUpdate({ repo: 'SumbaUser', id: req.user.id, body: form, req })).data
        console.log(form)
      } catch (err) {
        console.log('----', err)
      }
    }
    return reply.view('sumba:/profile', { form })
  }
}

export default profile
