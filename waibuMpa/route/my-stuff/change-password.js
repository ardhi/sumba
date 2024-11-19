import passwordRule from '../../../lib/password-rule.js'

const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep, importPkg } = this.app.bajo
    const { recordGet, recordUpdate } = this.app.dobo
    const bcrypt = await importPkg('bajoExtra:bcrypt')
    const Joi = await importPkg('dobo:joi')
    const model = 'SumbaUser'
    const form = defaultsDeep(req.body, {})
    let error
    if (req.method === 'POST') {
      try {
        const newPassword = await passwordRule.call(this)
        const schema = Joi.object({
          currentPassword: Joi.string().min(8).max(50).required(),
          newPassword,
          verifyNewPassword: Joi.ref('newPassword')
        })
        try {
          await schema.validateAsync(req.body, this.app.dobo.config.validationParams)
        } catch (err) {
          throw this.error('Validation Error', { details: err.details, values: err.values, ns: this.name, statusCode: 422, code: 'DB_VALIDATION' })
        }
        const rec = await recordGet(model, req.user.id)
        const verified = await bcrypt.compare(req.body.currentPassword, rec.password)
        if (!verified) throw this.error('Invalid current password', { details: [{ field: 'currentPassword', error: 'Invalid password' }], statusCode: 400 })
        await recordUpdate(model, req.user.id, { password: req.body.newPassword })
        // signout and redirect to signin
        req.session.user = null
        req.flash('notify', req.t('You\'ve successfully changed your password. Now please re-signin with your new password'))
        return reply.redirectTo('sumba:/signin')
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/my-stuff/change-password.html', { form, error })
  }
}

export default profile