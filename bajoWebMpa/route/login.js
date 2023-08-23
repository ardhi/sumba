const login = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { getConfig } = this.bajo.helper
    const { routePath } = this.bajoWeb.helper
    const { getUserFromUsernamePassword } = this.sumba.helper
    const cfg = getConfig('sumba')
    req.theme = 'adminlte3'
    let { username, password, referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    let error
    if (req.method === 'POST') {
      try {
        const user = await getUserFromUsernamePassword(username, password, req)
        req.session.user = user
        if (referer) reply.redirect(referer)
        else reply.redirect(routePath(cfg.redirect.home))
        return
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba:/login', { form: { username, referer }, error })
  }
}

export default login
