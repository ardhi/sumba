const profile = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    return reply.view('sumba:/forgot-password.html')
  }
}

export default profile
