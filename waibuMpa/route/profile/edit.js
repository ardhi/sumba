const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.bajo
    const { attachmentCopyUploaded } = this.app.dobo
    const { recordUpdate } = this.app.waibuDb
    const { has } = this.app.bajo.lib._
    const { hash } = this.app.bajoExtra

    let form = defaultsDeep(req.body, req.user)
    let error
    if (req.method === 'POST') {
      try {
        if (has(req.body, 'profile')) {
          const opts = { req, setField: 'profile', setFile: 'main.png' }
          await attachmentCopyUploaded('SumbaUser', req.user.id, opts)
        } else {
          form = (await recordUpdate({ model: 'SumbaUser', id: req.user.id, body: form, req })).data
        }
      } catch (err) {
        error = err
      }
    }
    form.token = await hash(form.token)
    return reply.view('sumba.template:/profile/edit.html', { form, error })
  }
}

export default profile
