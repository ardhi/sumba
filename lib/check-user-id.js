async function checkSiteId (req) {
  if (!req.routerPath) return
  const { getConfig, error, importPkg } = this.bajo.helper
  const { isEmpty, camelCase } = await importPkg('lodash-es')
  const outmatch = await importPkg('outmatch')
  let match
  for (const item of this.sumba.protectedRoutes) {
    const matchPath = outmatch(item.path, { separator: false })
    if (matchPath(req.routerPath)) {
      const matchMethods = outmatch(item.methods)
      if (matchMethods(req.routerMethod)) {
        match = item
        break
      }
    }
  }
  if (!match) return
  const authMethods = getConfig('sumba').auth[match.source] ?? []
  if (isEmpty(authMethods)) throw error('No authentication method found. Please contact your admin immediately!', { statusCode: 500 })
  let success = false
  for (const m of authMethods) {
    const handler = this.sumba.helper[camelCase(`verify ${m}`)]
    if (!handler) throw error('Invalid authentication method \'%s\'', m, { statusCode: 500 })
    const check = await handler(req)
    if (check) {
      success = true
      break
    }
  }
  if (!success) throw error('Access denied. Can\'t authenticate you through all available methods', { statusCode: 401 })
}

export default checkSiteId
