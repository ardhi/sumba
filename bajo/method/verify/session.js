async function verifySession (ctx, req, reply, source) {
  const { getUser } = this
  const { routePath } = this.app.waibu

  if (!req.session) return false
  if (req.session.user) {
    req.user = await getUser(req.session.user.id)
    return true
  }
  const redir = routePath(this.config.redirect.signin, req)
  req.session.ref = req.url
  throw this.error('redirect', { redirect: redir })
}

export default verifySession
