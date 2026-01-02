import passwordRule from '../../../../lib/password-rule.js'

const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.lib.aneka
    const { importPkg } = this.app.bajo
    const bcrypt = await importPkg('bajoExtra:bcrypt')
    const Joi = await importPkg('dobo:joi')
    const model = this.app.dobo.getModel('SumbaUser')
    const form = defaultsDeep(req.body, {})
    let error
    if (req.method === 'POST') {
      try {
        const newPassword = await passwordRule.call(this, req)
        const schema = Joi.object({
          currentPassword: Joi.string().min(8).max(50).required(),
          newPassword,
          verifyNewPassword: Joi.ref('newPassword')
        })
        try {
          await schema.validateAsync(req.body, this.app.dobo.config.validationParams)
        } catch (err) {
          throw this.error('validationError', { details: err.details, values: err.values, ns: this.ns, statusCode: 422, code: 'DB_VALIDATION' })
        }
        const rec = await model.getRecord(req.user.id, { forceNoHidden: true })
        const verified = await bcrypt.compare(req.body.currentPassword, rec.password)
        if (!verified) throw this.error('invalidCurrentPassword', { details: [{ field: 'currentPassword', error: 'invalidPassword' }], statusCode: 400 })
        await model.updateRecord(req.user.id, { password: req.body.newPassword }, { req, reply, noFlash: true })
        // signout and redirect to signin
        req.session.userId = null
        req.flash('notify', req.t('passwordChangedReSignin'))
        return reply.redirectTo(this.config.redirect.signin)
      } catch (err) {
        error = err
      }
    }
    return await reply.view('sumba.template:/your-stuff/change-password.html', { form, error })
  }
}

export default profile
