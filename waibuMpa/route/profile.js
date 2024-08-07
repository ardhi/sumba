const profile = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { defaultsDeep } = this.app.bajo
    const { attachmentCopyUploaded } = this.app.dobo
    const { recordUpdate } = this.app.waibu
    const { has } = this.app.bajo.lib._

    let form = defaultsDeep(req.body, req.user)
    if (req.method === 'POST') {
      try {
        if (has(req.body, 'profile')) {
          const opts = { req, setField: 'profile', setFile: 'main.png' }
          await attachmentCopyUploaded('SumbaUser', req.user.id, opts)
        } else {
          form = (await recordUpdate({ model: 'SumbaUser', id: req.user.id, body: form, req })).data
        }
      } catch (err) {
      }
    }
    return reply.view('sumba:/profile.html', { form })
  }
}

export default profile
