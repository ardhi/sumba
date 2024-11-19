const resetApiKey = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep, importPkg, generateId } = this.app.bajo
    const { recordGet, recordUpdate } = this.app.dobo
    const { hash } = this.app.bajoExtra
    const delay = await importPkg('delay')
    const bcrypt = await importPkg('bajoExtra:bcrypt')
    const Joi = await importPkg('dobo:joi')
    const model = 'SumbaUser'
    const form = defaultsDeep(req.body, { apiKey: await hash(req.user.token) })
    let error
    if (req.method === 'POST') {
      try {
        const schema = Joi.object({
          password: Joi.string().required()
        })
        try {
          await schema.validateAsync(req.body, this.app.dobo.config.validationParams)
        } catch (err) {
          throw this.error('Validation Error', { details: err.details, values: err.values, ns: this.name, statusCode: 422, code: 'DB_VALIDATION' })
        }
        const rec = await recordGet(model, req.user.id)
        const verified = await bcrypt.compare(req.body.password, rec.password)
        if (!verified) throw this.error('Validation Error', { details: [{ field: 'password', error: 'Invalid password' }], statusCode: 400 })
        await recordUpdate(model, req.user.id, { token: generateId() })
        await delay(2000) // ensure req.user cache is expired
        req.flash('notify', req.t('You\'ve successfully reset your Api Key'))
        return reply.redirectTo('sumba:/profile')
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/my-stuff/reset-api-key.html', { form, error })
  }
}

export default resetApiKey