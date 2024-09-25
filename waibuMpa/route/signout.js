const signout = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { routePath } = this.app.waibu
    const { isEmpty } = this.app.bajo.lib._

    let { referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    if (req.method === 'POST') {
      req.session.user = null
      const { query, params } = req
      const url = !isEmpty(referer) ? referer : routePath(this.config.redirect.home, { query, params })
      reply.redirect(url)
      return
    }
    return reply.view('sumba.template:/signout.html', { form: { referer } })
  }
}

export default signout
