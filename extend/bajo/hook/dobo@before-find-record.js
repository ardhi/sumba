const useAdmin = ['waibuAdmin']

export async function rebuildFilter (modelName, filter, req) {
  const { isEmpty, isPlainObject, map, find, get } = this.app.lib._
  filter.query = filter.query ?? {}

  const queryBySiteSetting = (query) => {
    if (!req.site) return
    const setting = get(req, `site.setting.dobo.query.${modelName}`)
    if (isPlainObject(setting) && !isEmpty(setting)) query.$and.push(setting)
  }

  const queryByTeamSetting = (query) => {
    if (!req.user) return
    const q = []
    for (const team of req.user.teams) {
      const item = get(team, `setting.dobo.query.${modelName}`)
      if (item) q.push(item)
    }
    if (isEmpty(q)) return
    if (q.length === 1) query.$and.push(q[0])
    else query.$and.push({ $or: q })
  }

  const model = this.app.dobo.getModel(modelName)
  const hasSiteId = model.hasProperty('siteId')
  const hasUserId = model.hasProperty('userId')
  const hasTeamId = model.hasProperty('teamId')
  const isAdmin = find(get(req, 'user.teams', []), { alias: 'administrator' }) && useAdmin.includes(get(req, 'routeOptions.config.ns'))
  const q = { $and: [] }
  queryBySiteSetting(q)
  queryByTeamSetting(q)
  if (!isEmpty(filter.query)) {
    if (filter.query.$and) q.$and.push(...filter.query.$and)
    else q.$and.push(filter.query)
  }
  /*
  if (!(hasSiteId || hasUserId || hasTeamId)) {
    return filter
  }
  */
  if (hasSiteId) q.$and.push({ siteId: req.site.id })
  if (hasTeamId && !isAdmin) {
    const teamIds = map(req.user.teams, 'id')
    if (hasUserId) q.$and.push({ $or: [{ teamId: { $in: teamIds } }, { userId: req.user.id }] })
    else q.$and.push({ teamId: { $in: teamIds } })
  } else if (!isAdmin) {
    if (hasUserId) q.$and.push({ userId: req.user.id })
  }
  filter.query = q
}

export async function handler (modelName, filter, options = {}) {
  const { req } = options
  if (options.noAutoFilter || !req) return
  await rebuildFilter.call(this, modelName, filter, req)
}

const doboBeforeFindRecord = {
  level: 1000,
  handler
}

export default doboBeforeFindRecord
