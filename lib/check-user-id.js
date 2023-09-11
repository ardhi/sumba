async function checker (req, needle, container) {
  const { importPkg } = this.bajo.helper
  const outmatch = await importPkg('outmatch')
  let match
  if (!container) container = this.sumba.secureRoutes
  for (const item of container) {
    const matchPath = outmatch(item.path, { separator: false })
    if (matchPath(req[needle])) {
      const matchMethods = outmatch(item.methods)
      if (matchMethods(req.method)) {
        match = item
        break
      }
    }
  }
  return match
}

async function anon (req) {
  if (!req.session) return
  if (req.session.user) {
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
  let match = await checker.call(this, req, 'routerPath')
  if (!match) {
    match = await checker.call(this, req, 'url')
  }
  if (!match) {
    await anon.call(this, req)
    return
  }
  // excluded ?
  let xmatch = await checker.call(this, req, 'routerPath', this.sumba.excludedRoutes)
  if (!xmatch) {
    xmatch = await checker.call(this, req, 'url', this.sumba.excludedRoutes)
  }
  if (xmatch) {
    await anon.call(this, req)
    return
  }
  if (xmatch) return
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
