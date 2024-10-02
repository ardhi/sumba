async function userActivation (req, reply) {
  const { recordFind, recordUpdate } = this.app.dobo
  const { isEmpty } = this.app.bajo.lib._

  const { key } = req.query
  let error
  if (!isEmpty(key)) {
    try {
      const query = { status: 'UNVERIFIED', token: key }
      const result = await recordFind('SumbaUser', { query }, { noHook: true })
      if (result.length === 0) throw this.error('Validation Error', { details: [{ field: 'key', error: 'Invalid activation key' }] })
      await recordUpdate('SumbaUser', result[0].id, { status: 'ACTIVE' }, { noHook: true, noValidation: true, noFlash: true })
      req.flash('notify', req.t('User account successfully activated'))
      return reply.redirectTo(this.config.redirect.signin, req)
    } catch (err) {
      error = err
      console.log(error)
    }
  }
  return reply.view('sumba.template:/user-activation.html', { form: { key }, error })
}

export default userActivation
