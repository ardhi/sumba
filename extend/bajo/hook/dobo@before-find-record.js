const useAdmin = ['waibuAdmin']

export async function rebuildFilter (filter, req) {
  const { isEmpty, map, find, get } = this.app.lib._
  filter.query = filter.query ?? {}
  const hasSiteId = this.hasProperty('siteId')
  const hasUserId = this.hasProperty('userId')
  const hasTeamId = this.hasProperty('teamId')
  const isAdmin = find(get(req, 'user.teams', []), { alias: 'administrator' }) && useAdmin.includes(get(req, 'routeOptions.config.ns'))
  if (!(hasSiteId || hasUserId || hasTeamId)) return filter
  const q = { $and: [] }
  if (!isEmpty(filter.query)) {
    if (filter.query.$and) q.$and.push(...filter.query.$and)
    else q.$and.push(filter.query)
  }
  if (hasSiteId) q.$and.push({ siteId: req.site.id })
  if (hasTeamId && !isAdmin) {
    const teamIds = map(req.user.teams, 'id')
    if (hasUserId) q.$and.push({ $or: [{ teamId: { $in: teamIds } }, { userId: req.user.id }] })
    else q.$and.push({ teamId: { $in: teamIds } })
  } else if (!isAdmin) {
    if (hasUserId) q.$and.push({ userId: req.user.id })
  }
  filter.query = q
  return filter
}

export async function handler (filter, options = {}) {
  const { req } = options
  if (options.noAutoFilter || !req) return
  filter = await rebuildFilter.call(this, filter, req)
}

const doboBeforeFindRecord = {
  level: 1000,
  handler
}

export default doboBeforeFindRecord
