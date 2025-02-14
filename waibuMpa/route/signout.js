const signout = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { runHook } = this.app.bajo
    // const { isEmpty } = this.app.bajo.lib._
    const { getSessionId } = this.app.waibuMpa

    let { referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    if (req.method === 'POST') {
      const sid = await getSessionId(req.headers.cookie)
      const user = req.session.user
      req.session.user = null
      if (this.bajoEmitter) await this.app.bajoEmitter.emit(`${this.name}.sigout`, user, sid)
      await runHook(`${this.name}:afterSignout`, user, sid, req)
      const { query, params } = req
      // const url = !isEmpty(referer) ? referer : this.config.redirect.home
      const url = this.config.redirect.afterSignout
      req.flash('notify', req.t('You\'ve successfully signed out!'))
      return reply.redirectTo(url, { query, params })
    }
    return reply.view('sumba.template:/signout.html', { form: { referer } })
  }
}

export default signout
