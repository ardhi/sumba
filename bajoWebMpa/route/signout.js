const login = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { getConfig } = this.bajo.helper
    const { routePath } = this.bajoWeb.helper
    const cfg = getConfig('sumba')
    if (req.method === 'POST') {
      req.session.user = null
      const { query, params } = req
      reply.redirect(routePath(cfg.redirect.home, { query, params }))
      return
    }
    return reply.view('sumba:/signout')
  }
}

export default login
