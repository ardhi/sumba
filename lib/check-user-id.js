async function checkSiteId (req) {
  const { getConfig, error, importPkg } = this.bajo.helper
  const { recordFind } = this.bajoDb.helper
  const { isEmpty } = await importPkg('lodash-es')
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
  const authMethods = getConfig(match.source).auth ?? []
  if (isEmpty(authMethods)) throw error('No authentication method found. Please contact your admin immediately!', { statusCode: 401 })
  for (const m of authMethods) {

  }
  throw error('Access denied. Please authenticate yourself to access this resource, thank you!', { statusCode: 401 })
  const cfg = getConfig('sumba')
}

export default checkSiteId
