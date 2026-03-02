import passwordRule from '../../../../../lib/password-rule.js'

async function getUser (req, reply) {
  const { dayjs } = this.app.lib
  const { findRecord } = this.app.waibuDb
  const invalidFpl = 'sumba.template:/user/fpl-invalid.html'
  if (Buffer.from(req.params.fpl, 'base64').toString('base64') !== req.params.fpl) return invalidFpl
  const fpToken = Buffer.from(req.params.fpl, 'base64').toString()
  const [token, sec] = fpToken.split(':')
  if (dayjs().unix() > Number(sec)) return invalidFpl
  const query = { token, status: 'ACTIVE' }
  const users = await findRecord({ model: 'SumbaUser', req, options: { query, limit: 1, dataOnly: true, noHook: true } })
  if (users.length === 0) return invalidFpl
  return users[0]
}

const forgotPasswordLink = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.lib.aneka
    const { importPkg } = this.app.bajo
    const { isString } = this.app.lib._
    const model = this.app.dobo.getModel('SumbaUser')
    const Joi = await importPkg('dobo:joi')

    const form = defaultsDeep(req.body, {})
    const user = await getUser.call(this, req, reply)
    if (isString(user)) return await reply.view(user)
    form.username = user.username
    let error
    if (req.method === 'POST') {
      try {
        const newPassword = await passwordRule.call(this, req)
        const schema = Joi.object({
          newPassword,
          verifyNewPassword: Joi.ref('newPassword')
        })
        try {
          await schema.validateAsync(req.body, this.app.dobo.config.validationParams)
        } catch (err) {
          throw this.error('validationError', { details: err.details, values: err.values, ns: this.ns, statusCode: 422, code: 'DB_VALIDATION' })
        }
        await model.updateRecord(user.id, { password: req.body.newPassword }, { noFlash: true })
        const to = `${user.firstName} ${user.lastName} <${user.email}>`
        const subject = req.t('forgotPasswordChanged')
        const options = { req, reply, tpl: '' }
        const payload = { to, subject, data: user }
        await this.sendMail(
          'sumba.template:/_mail/user-forgot-password-changed.html',
          { payload, options, source: this.ns }
        )
        req.flash('notify', req.t('passwordChangedReSignin'))
        return reply.redirectTo(this.config.redirect.signin)
      } catch (err) {
        error = err
      }
    }
    return await reply.view('sumba.template:/user/fpl.html', { form, error })
  }
}

export default forgotPasswordLink
