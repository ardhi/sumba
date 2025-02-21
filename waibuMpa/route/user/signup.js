const signup = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep, generateId } = this.app.bajo
    const { recordCreate } = this.app.waibuDb

    const form = defaultsDeep(req.body, {})
    let error
    if (req.method === 'POST') {
      const extFields = [{
        name: 'verifyPassword',
        type: 'string',
        minLength: 8,
        maxLength: 50,
        rules: ['ref:password']
      }, {
        name: 'agree',
        type: 'boolean',
        required: true
      }]
      try {
        const fields = ['username', 'password', 'verifyPassword', 'email', 'firstName', 'lastName', 'agree']
        const validation = { ns: ['sumba', 'dobo'], fields, extFields }
        req.body.token = generateId()
        const { data } = await recordCreate({ model: 'SumbaUser', req, reply, options: { validation, noFlash: true } })
        req.flash('notify', 'userCreated')
        return reply.view('sumba.template:/user/signup/success.html', { form: req.body, data })
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/user/signup/form.html', { form, error })
  }
}

export default signup
