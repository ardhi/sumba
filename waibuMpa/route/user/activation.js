const model = 'SumbaUser'

const userActivation = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.bajo
    const { recordFind, recordUpdate } = this.app.waibuDb
    const form = defaultsDeep(req.body, { key: req.query.key })
    let error
    if (req.method === 'POST') {
      try {
        const query = { status: 'UNVERIFIED', token: req.body.key }
        const result = await recordFind({ model, req, reply, options: { dataOnly: true, query, limit: 1, noHook: true } })
        if (result.length === 0) throw this.error('validationError', { details: [{ field: 'key', error: 'invalidActivationKey' }] })
        await recordUpdate({ model, req, reply, id: result[0].id, body: { status: 'ACTIVE' }, options: { noValidation: true, noFlash: true } })
        req.flash('notify', req.t('userActivated'))
        return reply.redirectTo(this.config.redirect.signin, req)
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/user/activation.html', { form, error })
  }
}

export default userActivation
