const home = {
  method: 'GET',
  handler: async function (req, reply) {
    return reply.view('sumba:/home.html')
  }
}

export default home
