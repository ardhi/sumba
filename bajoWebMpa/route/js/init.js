const home = {
  method: 'GET',
  url: '/js/init.js',
  handler: async function (ctx, req, reply) {
    return reply.view('sumba:/js/init.js')
  }
}

export default home
