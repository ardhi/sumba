import { pathsToCheck } from './check-user-id.js'

async function mergeRoles (req) {
  const { map } = this.app.bajo.lib._
  const { recordFindAll } = this.app.dobo
  req.user.roles = []
  const query = { userId: req.user.id, siteId: req.site.id }
  const userRoles = await recordFindAll('SumbaRoleUser', { query })
  if (userRoles.length === 0) return
  delete query.userId
  query.id = { $in: map(userRoles, 'id'), status: 'ENABLED' }
  const roles = await recordFindAll('SumbaRole', { query })
  if (roles.length > 0) req.user.roles.push(...map(roles, 'alias'))
}

async function checkRole (req, reply, source) {
  if (!req.user) return
  const { map } = this.app.bajo.lib._
  await mergeRoles.call(this, req)
  const paths = pathsToCheck.call(this, req, true)
  const match = this.checkPathsByRole({ paths, method: req.method, roles: req.user.roles, guards: this.roles })
  if (match) return
  const negMatch = this.checkPathsByRole({ paths, method: req.method, roles: req.user.roles, guards: this.negRoles })
  if (negMatch) return
  const guards = map(this.roles, r => r.path)
  // fallback
  const guarded = this.checkPathsByGuard({ paths, guards })
  if (!guarded) return
  throw this.error('permissionDenied', { statusCode: 403 })
}

export default checkRole
