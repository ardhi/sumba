const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    return reply.view('sumba.template:/user/forgot-password.html')
  }
}

export default profile
