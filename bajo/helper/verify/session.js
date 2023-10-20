async function verifySession (ctx, req, reply, source) {
  const { getConfig, error } = this.bajo.helper
  const { getUser } = this.sumba.helper
  const { routePath } = this.bajoWeb.helper
  const cfg = getConfig('sumba')
  if (!req.session) return false
  if (req.session.user) {
    req.user = await getUser(req.session.user.id)
    return true
  }
  const redir = routePath(cfg.redirect.signin, req)
  req.session.ref = req.url
  throw error('redirect', { redirect: redir })
}

export default verifySession
