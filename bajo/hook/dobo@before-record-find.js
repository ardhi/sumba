const useAdmin = ['waibuAdmin']

export async function rebuildFilter (model, filter, req) {
  const { isEmpty, map, find, get } = this.lib._
  const { hasColumn } = this
  filter.query = filter.query ?? {}
  const hasSiteId = await hasColumn('siteId', model)
  const hasUserId = await hasColumn('userId', model)
  const hasTeamId = await hasColumn('teamId', model)
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

export async function handler (model, filter, options = {}) {
  const { req } = options
  if (options.noAutoFilter || !req) return
  filter = await rebuildFilter.call(this, model, filter, req)
}

const doboBeforeRecordFind = {
  level: 1000,
  handler
}

export default doboBeforeRecordFind
