const model = 'SumbaUser'

const userActivation = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.lib.aneka
    const { recordFind, recordUpdate } = this.app.dobo
    const form = defaultsDeep(req.body, { key: req.query.key })
    let error
    if (req.method === 'POST') {
      try {
        const query = { status: 'UNVERIFIED', token: req.body.key }
        const result = await recordFind(model, { query, limit: 1 })
        if (result.length === 0) throw this.error('validationError', { details: [{ field: 'key', error: 'invalidActivationKey' }] })
        await recordUpdate(model, result[0].id, { status: 'ACTIVE' }, { req, noValidation: true, noFlash: true })
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
