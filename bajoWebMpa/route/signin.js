const signin = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { getConfig, importPkg } = this.bajo.helper
    const { routePath } = this.bajoWeb.helper
    const { getUserFromUsernamePassword } = this.sumba.helper
    const { isEmpty, pick } = this.bajo.helper._
    const cfg = getConfig('sumba')
    let { username, password, referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    let error
    if (req.method === 'POST') {
      try {
        const user = pick(await getUserFromUsernamePassword(username, password, req), ['id', 'username', 'email', 'siteId'])
        if (this.bajoEmitter) this.bajoEmitter.helper.emit('sumba.signin', user)
        req.session.user = user
        const { query, params } = req
        const url = !isEmpty(referer) ? referer : routePath(cfg.redirect.home, { query, params })
        reply.redirect(url)
        return
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba:/signin', { form: { username, referer }, error })
  }
}

export default signin
