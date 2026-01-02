import { pathsToCheck } from './check-user-id.js'

async function checkTeam (req, reply, source) {
  if (!req.user) return
  const { map } = this.app.lib._
  await this.mergeTeam(req.user, req.site)
  const paths = pathsToCheck.call(this, req, true)
  const teams = map(req.user.teams, 'alias')
  const match = this.checkPathsByTeam({ paths, method: req.method, teams, guards: this.teamRoutes })
  if (match) return
  const negMatch = this.checkPathsByTeam({ paths, method: req.method, teams, guards: this.teamNegRoutes })
  if (negMatch) return
  const guards = map(this.teamRoutes, 'path')
  // fallback
  const guarded = this.checkPathsByGuard({ paths, guards })
  if (!guarded) return
  throw this.error('accessDenied', { statusCode: 403 })
}

export default checkTeam
