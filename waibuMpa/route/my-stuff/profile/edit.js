const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.bajo
    const { attachmentCopyUploaded } = this.app.dobo
    const { recordUpdate, recordGet } = this.app.waibuDb
    const { has } = this.app.bajo.lib._
    const { hash } = this.app.bajoExtra
    const resp = await recordGet({ model: 'SumbaUser', req, id: req.user.id, options: { forceNoHidden: true, noHook: true, noCache: true } })
    let form = defaultsDeep(req.body, resp.data)
    let error
    if (req.method === 'POST') {
      try {
        if (has(req.body, 'profile')) {
          const opts = { req, setField: 'profile', setFile: 'main.png' }
          await attachmentCopyUploaded('SumbaUser', req.user.id, opts)
        } else {
          const resp = await recordUpdate({ req, model: 'SumbaUser', id: req.user.id, body: form, options: { noFlash: true, hidden: [] } })
          form = resp.data
          req.flash('notify', req.t('Your profile is successfully updated'))
        }
      } catch (err) {
        console.log(err)
        error = err
      }
    }
    if (form.token) form.token = await hash(form.token)
    return reply.view('sumba.template:/my-stuff/profile/edit.html', { form, error })
  }
}

export default profile
