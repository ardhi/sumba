async function verifySession (ctx, req, reply, source) {
  const { getConfig, error } = this.bajo.helper
  const { recordGet } = this.bajoDb.helper
  const { routePath } = this.bajoWeb.helper
  const cfg = getConfig('sumba')
  if (!req.session) return false
  if (req.session.user) {
    const user = await recordGet('SumbaUser', req.session.user.id, { skipHook: true })
    req.user = user
    return true
  }
  const redir = routePath(cfg.redirect.signin, req)
  req.session.ref = req.url
  throw error('redirect', { redirect: redir })
}

export default verifySession
