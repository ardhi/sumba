const signin = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { getConfig, importPkg } = this.bajo.helper
    const { routePath } = this.bajoWeb.helper
    const { getUserFromUsernamePassword } = this.sumba.helper
    const { emit } = this.bajoEmitter.helper
    const { isEmpty } = await importPkg('lodash-es')
    const cfg = getConfig('sumba')
    let { username, password, referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    let error
    if (req.method === 'POST') {
      try {
        const user = await getUserFromUsernamePassword(username, password, req)
        emit('sumba.signin', user)
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
