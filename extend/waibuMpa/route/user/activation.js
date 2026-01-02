const userActivation = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.lib.aneka
    const form = defaultsDeep(req.body, { key: req.query.key })
    const model = this.app.dobo.getModel('SumbaUser')
    let error
    if (req.method === 'POST') {
      try {
        const query = { status: 'UNVERIFIED', token: req.body.key }
        const result = await model.findRecord({ query, limit: 1 })
        if (result.length === 0) throw this.error('validationError', { details: [{ field: 'key', error: 'invalidActivationKey' }] })
        await model.updateRecord(result[0].id, { status: 'ACTIVE' }, { req, noValidation: true, noFlash: true })
        req.flash('notify', req.t('userActivated'))
        return reply.redirectTo(this.config.redirect.signin, req)
      } catch (err) {
        error = err
      }
    }
    return await reply.view('sumba.template:/user/activation.html', { form, error })
  }
}

export default userActivation
