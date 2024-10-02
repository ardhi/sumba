const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.bajo
    const { recordUpdate, attachmentCopyUploaded } = this.app.dobo
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
          form = await recordUpdate('SumbaUser', req.user.id, form, { noFlash: true })
          req.flash('notify', req.t('Your profile is successfully updated'))
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
