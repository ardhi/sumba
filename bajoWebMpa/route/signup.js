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
        const { data } = await recordCreate({ coll: 'SumbaUser', req, reply, options: { validation } })
        return reply.view('sumba:/signup-success', { form: req.body, data })
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba:/signup', { form: req.body, error })
  }
}

export default signup
