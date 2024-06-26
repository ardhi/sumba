async function checker (req, container) {
  const { getConfig, outmatch } = this.bajo.helper
  const { get } = this.bajo.helper._
  let match
  for (const item of container) {
    let path = item.path
    const isI18n = get(getConfig(item.source), 'i18n.detectors', []).includes('path')
    if (isI18n) path = `/${req.lang}${path}`
    const matchPath = outmatch(path, { separator: false })
    const checks = [req.routeOptions.url, req.url]
    for (const check of checks) {
      if (matchPath(check)) {
        const matchMethods = outmatch(item.methods)
        if (matchMethods(req.method)) {
          match = item
          break
        }
      }
    }
    if (match) break
  }
  return match
}

async function anonymous (req) {
  const { error, getConfig } = this.bajo.helper
  const { getUser } = this.sumba.helper
  const { routePath } = this.bajoWeb.helper
  const cfg = getConfig('sumba')
  if (!req.session) return
  if (req.session.user) {
    const match = await checker.call(this, req, this.sumba.anonymousRoutes)
    if (match) {
      const redir = routePath(cfg.redirect.signout, req)
      req.session.ref = req.url
      throw error('redirect', { redirect: redir })
    }
    req.user = await getUser(req.session.user.id)
  }
}

async function mergeSetting (req) {
  const { getConfig } = this.bajo.helper
  const { recordFind } = this.bajoDb.helper
  const filter = { query: { siteId: req.site.id, userId: req.user.id }, limit: 1 }
  const settings = await recordFind('SumbaUserSetting', filter, { noHook: true })
  req.user.setting = settings[0] ?? { theme: getConfig('bajoWebMpa').theme ?? '' }
}

async function checkUserId (req, reply, source) {
  const { getConfig, error } = this.bajo.helper
  const ctx = this[source].instance
  if (!req.routeOptions.url) return
  const { isEmpty, camelCase } = this.bajo.helper._
  const match = await checker.call(this, req, this.sumba.secureRoutes)
  if (!match) {
    await anonymous.call(this, req)
    return
  }
  // excluded ?
  const xmatch = await checker.call(this, req, this.sumba.secureInvRoutes)
  if (xmatch) {
    await anonymous.call(this, req)
    return
  }
  const authMethods = getConfig('sumba').auth[match.source].methods ?? []
  if (isEmpty(authMethods)) throw error('No authentication method found. Please contact your admin immediately!', { statusCode: 500 })
  let success
  for (const m of authMethods) {
    const handler = this.sumba.helper[camelCase(`verify ${m}`)]
    if (!handler) throw error('Invalid authentication method \'%s\'', m, { statusCode: 500 })
    const check = await handler(ctx, req, reply, source)
    if (check) {
      success = check
      break
    }
  }
  if (!success) throw error('Access denied. Can\'t authenticate you through all available methods', { statusCode: 401 })
  await mergeSetting.call(this, req)
  return success
}

export default checkUserId
