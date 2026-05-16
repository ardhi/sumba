async function applyModelGuard ({ model, q, teamIds, options }) {
  const { isEmpty, get, set, uniq } = this.app.lib._
  const { req } = options
  const { getModel } = this.app.dobo

  const guards = []
  const query = { status: 'ACTIVE', siteId: req.site.id + '' }
  const results = await getModel('SumbaModelGuard').findAllRecord({ query }, { noMagic: true, dataOnly: true, noDriverHook: true })
  const item = {}

  function add (res) {
    item[res.column].push(...res.value)
  }

  for (const res of results) {
    res.teamIds = res.teamIds ?? []
    if (!(res.models ?? []).includes(model.name) || isEmpty(res.value)) continue
    item[res.column] = item[res.column] ?? []
    if (teamIds.length > 0) {
      for (const id of res.teamIds) {
        if (teamIds.includes(id)) add(res)
      }
    }
  }
  for (const key in item) {
    item[key] = uniq(item[key])
    if (item[key].length === 0) continue
    guards.push(set({}, key, { $in: item[key] }))
  }

  const allowEmpty = get(this, `config.dobo.model.${model.name}.allowEmptyQuery`, true)
  if (guards.length === 0 && !allowEmpty) throw this.error('_emptyColumnQuery') // signal driver to about with no result immediately
  q.$and.push(...guards)
}

export async function applyAttribGuard ({ model, teamIds, options }) {
  const { getModel } = this.app.dobo
  const { uniq } = this.app.lib._
  const { req } = options

  const query = { status: 'ACTIVE', siteId: req.site.id + '' }
  const results = await getModel('SumbaAttribGuard').findAllRecord({ query }, { noMagic: true, dataOnly: true, noDriverHook: true })
  const result = results.find(item => (item.models ?? []).includes(model.name))
  if (!result) return
  options.hidden = options.hidden ?? []
  for (const id of result.teamIds ?? []) {
    if (teamIds.includes(id)) options.hidden.push(...(result.hiddenCols ?? []))
  }
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
  if (req.routeOptions.config.crossSite) return
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
