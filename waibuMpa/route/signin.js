const signin = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { routePath } = this.app.waibu
    const { getUserFromUsernamePassword } = this
    const { isEmpty, pick } = this.app.bajo.lib._

    let { username, password, referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    let error
    if (req.method === 'POST') {
      try {
        const user = pick(await getUserFromUsernamePassword(username, password, req), ['id', 'username', 'email', 'siteId'])
        if (this.bajoEmitter) await this.app.bajoEmitter.emit('sumba.signin', user)
        req.session.user = user
        const { query, params } = req
        const url = !isEmpty(referer) ? referer : routePath(this.config.redirect.home, { query, params })
        reply.redirect(url)
        return
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba:/signin.html', { form: { username, referer }, error })
  }
}

export default signin
