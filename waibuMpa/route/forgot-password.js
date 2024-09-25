const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    return reply.view('sumba.template:/forgot-password.html')
  }
}

export default profile
