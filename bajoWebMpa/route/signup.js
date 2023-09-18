const signup = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    return reply.view('sumba:/signup')
  }
}

export default signup
