async function checker (req, container) {
  const { outmatch } = this.app.bajo.lib
  const { get } = this.app.bajo.lib._

  let match
  for (const item of container) {
    let path = item.path
    const isI18n = get(this.app[item.source], 'config.i18n.detectors', []).includes('path')
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
  const { omit } = this.app.bajo.lib._
  const { getUser } = this
  const { routePath } = this.app.waibu

  if (!req.session) return
  if (req.session.user) {
    const match = await checker.call(this, req, this.anonymousRoutes)
    if (match) {
      const redir = routePath(this.config.redirect.signout, req)
      req.session.ref = req.url
      throw this.error('redirect', { redirect: redir })
    }
    req.user = omit(await getUser(req.session.user.id), ['password', 'token'])
  }
}

async function mergeSetting (req) {
  req.user.setting = {}
}

async function checkUserId (req, reply, source) {
  const { isEmpty, camelCase } = this.app.bajo.lib._

  const ctx = this.app[source].instance
  if (!req.routeOptions.url) return
  const match = await checker.call(this, req, this.secureRoutes)
  if (!match) {
    await anonymous.call(this, req)
    return
  }
  // excluded ?
  const xmatch = await checker.call(this, req, this.secureInvRoutes)
  if (xmatch) {
    await anonymous.call(this, req)
    return
  }
  const authMethods = this.config.auth[match.source].methods ?? []
  if (isEmpty(authMethods)) throw this.error('No authentication method found. Please contact your admin immediately!', { statusCode: 500 })
  let success
  for (const m of authMethods) {
    const handler = this[camelCase(`verify ${m}`)]
    if (!handler) throw this.error('Invalid authentication method \'%s\'', m, { statusCode: 500 })
    const check = await handler(req, reply, source, ctx)
    if (check) {
      success = check
      break
    }
  }
  if (!success) throw this.error('Access denied. Can\'t authenticate you through all available methods', { statusCode: 401 })
  await mergeSetting.call(this, req)
  return success
}

export default checkUserId
