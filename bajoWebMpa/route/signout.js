const signout = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { getConfig, importPkg } = this.bajo.helper
    const { routePath } = this.bajoWeb.helper
    const { isEmpty } = this.bajo.helper._
    const cfg = getConfig('sumba')
    let { referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    if (req.method === 'POST') {
      req.session.user = null
      const { query, params } = req
      const url = !isEmpty(referer) ? referer : routePath(cfg.redirect.home, { query, params })
      reply.redirect(url)
      return
    }
    return reply.view('sumba:/signout', { form: { referer } })
  }
}

export default signout
