import { parseNsSettings } from './util.js'

async function getUser (rec, safe = true) {
  const { runHook } = this.app.bajo
  const { map, pick, omit, isPlainObject } = this.app.lib._
  const { getModel } = this.app.dobo
  await runHook(`${this.ns}:beforeGetUser`, rec, safe)
  let user
  if (!isPlainObject(rec)) {
    const mdl = getModel('SumbaUser')
    user = await mdl.getRecord(rec, { noHook: true, throwNotFound: false })
  } else {
    user = rec
  }
  if (!user) return null
  // merge teams
  user.teams = []
  const query = { userId: user.id, siteId: user.siteId }
  let mdl = getModel('SumbaTeamUser')
  const userTeam = await mdl.findAllRecord({ query })
  if (userTeam.length === 0) return
  delete query.userId
  query.id = { $in: map(userTeam, 'teamId') }
  query.status = 'ENABLED'
  mdl = getModel('SumbaTeam')
  const teams = await mdl.findAllRecord({ query })
  if (teams.length > 0) {
    // setting
    delete query.id
    delete query.status
    query.siteId = user.siteId
    query.teamId = { $in: teams.map(t => t.id + '') }
    mdl = getModel('SumbaTeamSetting')
    const items = await mdl.findAllRecord({ query })
    for (const team of teams) {
      const names = map(items, 'ns')
      const item = pick(team, ['id', 'alias'])
      item.setting = {}
      for (const ns of names) {
        parseNsSettings.call(this, ns, item.setting, items.filter(s => s.teamId === (team.id + '')))
      }
      user.teams.push(item)
    }
  }
  user = safe ? omit(user, this.unsafeUserFields) : user
  await runHook(`${this.ns}:afterGetUser`, rec, safe, user)
  return user
}

export default getUser
