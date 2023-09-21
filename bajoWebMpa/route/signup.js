const signup = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { recordCreate } = this.bajoWeb.helper
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
        const validation = { ns: ['sumba', 'bajoDb'], fields, extProperties }
        const result = await recordCreate({ repo: 'SumbaUser', req, reply, options: { validation } })
        console.log(result)
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba:/signup', { form: req.body, error })
  }
}

export default signup
