async function applyModelGuard ({ model, q, teamIds, options }) {
  const { get, set, orderBy, intersection, without } = this.app.lib._
  const { include } = this.app.lib.aneka
  const { req } = options
  const results = []

  const guards = await this.getModelGuards()
  const columns = model.getNonVirtualProperties().map(prop => prop.name)
  const filterFn = item => {
    const bySiteId = item.siteIds.includes(req.site.id + '')
    const byModel = item.models.includes(model.name)
    const byTeamId = item.teamIds.length === 0 || include(item.teamIds, teamIds)
    const byColumn = columns.includes(item.column)
    return bySiteId && byModel && byTeamId && byColumn
  }

  guards.global = orderBy(guards.global.filter(filterFn), ['column'])
  guards.local = orderBy(guards.local.filter(filterFn), ['column'])
  for (const col of columns) {
    let values = []
    let items = guards.global.filter(item => item.column === col && !item.negation)
    for (const item of items) {
      values.push(...item.value)
    }
    items = guards.global.filter(item => item.column === col && item.negation)
    for (const item of items) {
      values = without(values, ...item.value)
    }
    items = guards.local.filter(item => item.column === col && !item.negation)
    const newValues = []
    for (const item of items) {
      newValues.push(...item.value)
    }
    if (newValues.length > 0) values = intersection(values, newValues)
    items = guards.local.filter(item => item.column === col && item.negation)
    for (const item of items) {
      values = without(values, ...item.value)
    }
    if (values.length) results.push(set({}, col, { $in: values }))
  }

  const allowEmpty = get(this, `config.dobo.model.${model.name}.allowEmptyQuery`, true)
  if (results.length === 0 && !allowEmpty) throw this.error('_emptyColumnQuery') // signal driver to about with no result immediately
  q.$and.push(...results)
}

export async function applyAttribGuard ({ model, teamIds, options }) {
  const { uniq } = this.app.lib._
  const { include } = this.app.lib.aneka
  const { req } = options
  const results = []

  const guards = await this.getAttribGuards()
  const filterFn = item => {
    const bySiteId = item.siteIds.includes(req.site.id + '')
    const byModel = item.models.includes(model.name)
    const byTeamId = item.teamIds.length === 0 || include(item.teamIds, teamIds)
    return bySiteId && byModel && byTeamId
  }

  let item = guards.global.filter(filterFn)[0]
  if (item) results.push(...item.hiddenCols)
  item = guards.local.filter(filterFn)[0]
  if (item) results.push(...item.hiddenCols)
  options.hidden = options.hidden ?? []
  if (results.length > 0) options.hidden.push(...results)
  options.hidden = uniq(options.hidden)
}

export async function rebuildFilter (model, filter = {}, options = {}) {
  const { isEmpty, get } = this.app.lib._
  const { req } = options
  const hasSiteId = model.hasProperty('siteId')
  const hasUserId = model.hasProperty('userId')
  const hasTeamId = model.hasProperty('teamId')
  const teams = get(req, 'user.teams', [])
  const teamIds = teams.map(team => team.id + '')
  const aliases = teams.map(team => team.alias)
  const q = { $and: [] }

  filter.query = filter.query ?? {}
  if (!isEmpty(filter.query)) {
    if (filter.query.$and) q.$and.push(...filter.query.$and)
    else q.$and.push(filter.query)
  }
  if (req.routeOptions.config.xSite) return
  if (hasSiteId) q.$and.push({ siteId: req.site.id + '' })
  if (aliases.includes('administrator')) {
    filter.query = q
    return
  }

  if (hasTeamId) {
    if (hasUserId) q.$and.push({ $or: [{ teamId: { $in: teamIds } }, { userId: req.user.id + '' }] })
    else q.$and.push({ teamId: { $in: teamIds } })
  } else if (hasUserId) q.$and.push({ userId: req.user.id + '' })

  await applyModelGuard.call(this, { model, q, teamIds, options })
  await applyAttribGuard.call(this, { model, teamIds, options })
  filter.query = q
}

export async function handler (model, filter, options = {}) {
  const { isEmpty } = this.app.lib._
  if (options.noAutoFilter || !options.req || isEmpty((options.req ?? {}).site)) return
  await rebuildFilter.call(this, model, filter, options)
}

const doboBeforeDriverFindRecord = {
  level: 1000,
  handler
}

export default doboBeforeDriverFindRecord
