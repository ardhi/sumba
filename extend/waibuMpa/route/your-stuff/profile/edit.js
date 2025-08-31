const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.lib.aneka
    // const { attachmentCopyUploaded } = this.app.dobo
    const { recordUpdate, recordGet } = this.app.waibuDb
    const { omit, pick } = this.app.lib._
    const { hash } = this.app.bajoExtra
    const resp = await recordGet({ model: 'SumbaUser', req, id: req.user.id, options: { forceNoHidden: true, noHook: true, noCache: true } })
    let form = defaultsDeep(req.body, omit(resp.data, ['password']))
    form.token = await hash(form.token)
    let error
    if (req.method === 'POST') {
      try {
        const body = pick(form, ['firstName', 'lastName', 'address1', 'address2', 'city', 'zipCode', 'provinceState', 'country', 'phone', 'website'])
        const options = { noFlash: true, hidden: [], setField: 'profile', setFile: 'main.png' }
        const resp = await recordUpdate({ req, reply, model: 'SumbaUser', id: req.user.id, body, options })
        form = resp.data
        req.flash('notify', req.t('profileUpdated'))
        return reply.redirectTo('sumba:/your-stuff/profile')
      } catch (err) {
        error = err
      }
    }
    return await reply.view('sumba.template:/your-stuff/profile/edit.html', { form, error })
  }
}

export default profile
