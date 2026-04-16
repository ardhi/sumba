const fields = ['email', 'firstName', 'lastName', 'address1', 'address2', 'city', 'zipCode', 'provinceState', 'country', 'phone', 'website']

const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.lib.aneka
    // const { attachmentCopyUploaded } = this.app.dobo
    const { updateRecord, getRecord } = this.app.waibuDb
    const { omit, pick } = this.app.lib._
    const { hash } = this.app.bajoExtra
    const resp = await getRecord({ model: 'SumbaUser', req, id: req.user.id, options: { forceNoHidden: ['token'], noHook: true, noCache: true, formatValue: true, retainOriginalValue: true } })
    let form = defaultsDeep(req.body, omit(resp.data, ['password', 'salt']))
    form.token = await hash(form.token)
    let error
    if (req.method === 'POST') {
      try {
        const body = pick(form, fields)
        const options = { noFlash: true, hidden: [], setField: 'profile', setFile: 'main.png', partial: true, fields }
        const resp = await updateRecord({ req, reply, model: 'SumbaUser', id: req.user.id, body, options })
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
