const fields = ['email', 'firstName', 'lastName', 'address1', 'address2', 'city', 'zipCode', 'provinceState', 'country', 'phone', 'website']
const model = 'SumbaUser'

const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.lib.aneka
    const { updateRecord, getRecord } = this.app.waibuDb
    const { getSchemaExt } = this.app.waibuDb
    const { omit, pick } = this.app.lib._

    const options = { forceNoHidden: ['token'], noHook: true, noCache: true, fmt: true }
    const mdl = this.app.dobo.getModel(model)

    const { schema } = await getSchemaExt(model, 'edit', { ...options, args: [{ req, model: mdl }] })

    const resp = await getRecord({ model, req, id: req.user.id, options })
    let form = defaultsDeep(req.body, omit(resp.data, ['password', 'salt']))
    let error
    if (req.method === 'POST') {
      try {
        const body = pick(form, fields)
        const options = { noFlash: true, hidden: [], setField: 'profile', setFile: 'main.png', partial: true, fields }
        const resp = await updateRecord({ req, reply, model, id: req.user.id, body, options })
        form = resp.data
        req.flash('notify', req.t('profileUpdated'))
        return reply.redirectTo('sumba:/your-stuff/profile')
      } catch (err) {
        error = err
      }
    }
    return await reply.view('sumba.template:/your-stuff/profile/edit.html', { form, error, schema })
  }
}

export default profile
