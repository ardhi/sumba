import passwordRule from '../../../../lib/password-rule.js'

const resetUserPassword = {
  method: ['GET', 'POST'],
  title: 'resetUserPassword',
  handler: async function (req, reply) {
    const { importPkg } = this.app.bajo
    const { recordFindOne, recordUpdate } = this.app.dobo
    const { defaultsDeep } = this.lib.aneka
    const Joi = await importPkg('dobo:joi')
    const model = 'SumbaUser'
    const form = defaultsDeep(req.body, { username: req.query.username })
    let error
    if (req.method === 'POST') {
      try {
        const password = await passwordRule.call(this, req)
        const schema = Joi.object({
          username: Joi.string().max(50).required(),
          password,
          verifyPassword: Joi.ref('password')
        })
        try {
          await schema.validateAsync(req.body, this.app.dobo.config.validationParams)
        } catch (err) {
          throw this.error('validationError', { details: err.details, values: err.values, ns: this.name, statusCode: 422, code: 'DB_VALIDATION' })
        }
        const rec = await recordFindOne(model, { query: { username: req.body.username } })
        if (!rec) throw this.error('unknownUser', { details: [{ field: 'username', error: 'unknownUser' }], statusCode: 400 })
        await recordUpdate(model, rec.id, { password: req.body.password }, { req, reply })
        form.password = ''
        form.verifyPassword = ''
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/_admin/reset-user-password.html', { form, error })
  }
}

export default resetUserPassword
