const userActivation = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.bajo
    const { recordFind, recordUpdate } = this.app.dobo
    const form = defaultsDeep(req.body, { key: req.query.key })
    let error
    if (req.method === 'POST') {
      try {
        const query = { status: 'UNVERIFIED', token: req.body.key }
        const result = await recordFind('SumbaUser', { query }, { noHook: true })
        if (result.length === 0) throw this.error('Validation Error', { details: [{ field: 'key', error: 'Invalid activation key' }] })
        await recordUpdate('SumbaUser', result[0].id, { status: 'ACTIVE' }, { noHook: true, noValidation: true, noFlash: true })
        req.flash('notify', req.t('User account successfully activated'))
        return reply.redirectTo(this.config.redirect.signin, req)
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/user-activation.html', { form, error })
  }
}

export default userActivation
