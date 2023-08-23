const home = {
  method: 'GET',
  handler: async function (ctx, req, reply) {
    return reply.view('sumba:/test')
  }
}

export default home
