const login = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { getConfig } = this.bajo.helper
    const { routePath } = this.bajoWeb.helper
    const cfg = getConfig('sumba')
    if (req.method === 'POST') {
      req.session.user = null
      reply.redirect(routePath(cfg.redirect.home))
      return
    }
    return reply.view('sumba:/logout')
  }
}

export default login
