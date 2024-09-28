const signin = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
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
        const url = !isEmpty(referer) ? referer : this.config.redirect.home
        req.flash('notify', req.t('You\'ve successfully signed in!'))
        return reply.redirectTo(url, { query, params })
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/signin.html', { form: { username, referer }, error })
  }
}

export default signin
