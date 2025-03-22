import { pathsToCheck } from './check-user-id.js'

async function mergeTeam (req) {
  const { map, pick } = this.lib._
  const { recordFindAll } = this.app.dobo
  req.user.teams = []
  const query = { userId: req.user.id, siteId: req.site.id }
  const userTeam = await recordFindAll('SumbaTeamUser', { query })
  if (userTeam.length === 0) return
  delete query.userId
  query.id = { $in: map(userTeam, 'id'), status: 'ENABLED' }
  const team = await recordFindAll('SumbaTeam', { query })
  if (team.length > 0) req.user.teams.push(...map(team, t => pick(t, ['id', 'alias'])))
}

async function checkTeam (req, reply, source) {
  if (!req.user) return
  const { map } = this.lib._
  await mergeTeam.call(this, req)
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
