const infoItem = {
  method: 'GET',
  handler: async function (req, reply) {
    return reply.view(`sumba.template:/info/${req.params.item}.md`)
  }
}

export default infoItem
