const signout = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { isEmpty } = this.app.bajo.lib._

    let { referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    if (req.method === 'POST') {
      req.session.user = null
      const { query, params } = req
      const url = !isEmpty(referer) ? referer : this.config.redirect.home
      req.flash('notify', req.t('You\'ve successfully signed out!'))
      return reply.redirectTo(url, { query, params })
    }
    return reply.view('sumba.template:/signout.html', { form: { referer } })
  }
}

export default signout
