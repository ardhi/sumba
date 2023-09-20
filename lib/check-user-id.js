async function checker (req, container) {
  const { importPkg, getConfig } = this.bajo.helper
  const { get } = await importPkg('lodash-es')
  const outmatch = await importPkg('outmatch')
  let match
  for (const item of container) {
    const matchPath = outmatch(item.path, { separator: false })
    for (const path of ['routerPath', 'url']) {
      let pattern = req[path]
      const isI18n = get(getConfig(item.source), 'i18nDetectors', []).includes('path')
      if (isI18n) {
        const [,, ...paths] = pattern.split('/')
        pattern = '/' + paths.join('/')
      }
      if (matchPath(pattern)) {
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
    const user = req.session.user
    req.user = user
  }
}

async function mergeSetting (req) {
  const { getConfig } = this.bajo.helper
  const { recordFind } = this.bajoDb.helper
  const filter = { query: { siteId: req.site.id, userId: req.user.id }, limit: 1 }
  const settings = await recordFind('SumbaUserSetting', filter)
  req.user.setting = settings[0] ?? { theme: getConfig('bajoWebMpa').theme ?? '' }
}

async function checkUserId (req, reply, source) {
  const { getConfig, error, importPkg } = this.bajo.helper
  const ctx = this[source].instance
  if (!req.routerPath) return
  const { isEmpty, camelCase } = await importPkg('lodash-es')
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
