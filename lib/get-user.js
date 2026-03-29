import { parseNsSettings } from './util.js'

export async function mergeTeam (user) {
  const { map, pick } = this.app.lib._
  const { getModel } = this.app.dobo
  user.interSiteAdmin = this.config.interSiteAdmins.includes(user.id)
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
  for (const field of this.unsafeUserFields) {
    delete user[field]
  }
}

export async function getUserById (id, req) {
  const { getModel } = this.app.dobo
  const { set: setCache, get: getCache } = this.app.bajoCache ?? {}
  const key = `getUserById|${id}`
  let user
  if (getCache) {
    user = await getCache({ key })
    if (user) return JSON.parse(user)
  }
  user = await getModel('SumbaUser').getRecord(id, { noHook: true, throwNotFound: false, req })
  if (!user) return
  await mergeTeam.call(this, user)
  if (setCache) {
    await setCache({ key, value: JSON.stringify(user), ttl: this.config.cacheTtl.getUserByIdDur })
  }
  return user
}

export async function getUserByToken (token, req) {
  const { getModel } = this.app.dobo
  const { set: setCache, get: getCache } = this.app.bajoCache ?? {}
  const key = `getUserByToken|${token}`
  let user
  if (getCache) {
    user = await getCache({ key })
    if (user) return JSON.parse(user)
  }
  user = await getModel('SumbaUser').findOneRecord({ query: { token } }, { noHook: true, throwNotFound: false, req })
  if (!user) return
  await mergeTeam.call(this, user)
  if (setCache) {
    await setCache({ key, value: JSON.stringify(user), ttl: this.config.cacheTtl.getUserByTokenDur })
  }
  return user
}

export async function getUserByUsernamePassword (username = '', password = '', req) {
  const { getModel } = this.app.dobo
  const { importPkg } = this.app.bajo
  const model = getModel('SumbaUser')
  await model.validate({ username, password }, null, { partial: true, ns: ['sumba', 'dobo'], fields: ['username', 'password'] })
  const bcrypt = await importPkg('bajoExtra:bcrypt')

  const query = { username, provider: 'local', siteId: req.site.id }
  const user = await model.findOneRecord({ query }, { req, forceNoHidden: true, noHook: true })
  if (!user) throw this.error('validationError', { details: [{ field: 'username', error: 'Unknown username' }], statusCode: 401 })
  if (user.status !== 'ACTIVE') throw this.error('validationError', { details: ['User is inactive or temporarily disabled'], statusCode: 401 })
  const verified = await bcrypt.compare(password, user.password)
  if (!verified) throw this.error('validationError', { details: [{ field: 'password', error: 'invalidPassword' }], statusCode: 401 })
  await mergeTeam.call(this, user)
  return user
}
