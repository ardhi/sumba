const signup = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { recordCreate } = this.app.waibu

    let error
    if (req.method === 'POST') {
      const extProperties = [{
        name: 'password2',
        type: 'string',
        minLength: 8,
        maxLength: 50,
        required: true,
        rules: ['ref:password']
      }]
      try {
        const fields = ['username', 'password', 'password2', 'email', 'firstName', 'lastName']
        const validation = { ns: ['sumba', 'dobo'], fields, extProperties }
        const { data } = await recordCreate({ model: 'SumbaUser', req, reply, options: { validation } })
        return reply.view('sumba.template:/signup-success.html', { form: req.body, data })
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/signup.html', { form: req.body, error })
  }
}

export default signup
