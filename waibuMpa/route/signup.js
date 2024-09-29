const signup = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.bajo
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
      }]
      try {
        const fields = ['username', 'password', 'verifyPassword', 'email', 'firstName', 'lastName']
        const validation = { ns: ['sumba', 'dobo'], fields, extFields }
        const { data } = await recordCreate({ model: 'SumbaUser', req, reply, options: { validation } })
        return reply.view('sumba.template:/signup/success.html', { form: req.body, data })
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/signup/form.html', { form, error })
  }
}

export default signup
