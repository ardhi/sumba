const signin = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { getUserFromUsernamePassword } = this
    const { runHook } = this.app.bajo
    const { isEmpty, omit } = this.lib._
    const { getSessionId } = this.app.waibuMpa

    let { username, password, referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    let error
    if (req.method === 'POST') {
      try {
        const user = omit(await getUserFromUsernamePassword(username, password, req), ['password', 'token'])
        req.session.user = user
        const sid = await getSessionId(req.headers.cookie)
        if (this.bajoEmitter) await this.app.bajoEmitter.emit(`${this.name}.signin`, user, sid)
        await runHook(`${this.name}:afterSignin`, user, sid, req)
        const { query, params } = req
        const url = !isEmpty(referer) ? referer : this.config.redirect.afterSignin
        req.flash('notify', req.t('signinSuccessfully'))
        return reply.redirectTo(url, { query, params })
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/signin.html', { form: { username, referer }, error })
  }
}

export default signin
