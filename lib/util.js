export function parseNsSettings (ns, setting, items) {
  const { trim, set, isPlainObject, isArray, isEmpty, find } = this.app.lib._
  const { parseObject, dayjs } = this.app.lib

  for (const item of items) {
    if (item.ns === '_var' || ns === '_var') continue
    let value = trim([item.value] ?? '')
    if (value[0] === '#' && value[value.length - 1] === '#') {
      const val = value.slice(1, -1)
      const newValue = find(items, { ns: '_var', key: val })
      if (newValue) value = newValue.value
    }
    if (['[', '{'].includes(value[0]) && [']', '}'].includes(value[value.length - 1])) {
      try {
        value = parseObject(JSON.parse(value))
      } catch (err) {}
    } else if (Number(value)) value = Number(value)
    else if (['true', 'false'].includes(value)) value = value === 'true'
    else if (item.key.endsWith('$in')) value = value.split('\n').map(v => v.trim())
    else {
      const dt = dayjs(value)
      if (dt.isValid()) value = dt.toDate()
    }
    if ((isPlainObject(value) || isArray(value)) && isEmpty(value)) continue
    set(setting, `${ns}.${item.key}`, value)
  }
}

export function pathsToCheck (req, withHome) {
  const { uniq, without } = this.app.lib._
  const items = [req.routeOptions.url, req.url]
  return uniq(without(items, undefined, null))
}

export async function checkIconset (req, reply) {
  const { get, isString } = this.app.lib._
  const mpa = this.app.waibuMpa

  if (!req.site) return
  const siteIconset = get(req, 'site.setting.waibuMpa.iconset')
  req.iconset = siteIconset ?? get(mpa, 'config.iconset.set', 'default')
  const hiconset = req.headers['x-iconset']
  if (isString(hiconset) && mpa.getIconset(hiconset)) req.iconset = hiconset
  req.iconset = req.iconset ?? 'default'
}

export async function checkTheme (req, reply) {
  const { get, isString } = this.app.lib._
  const mpa = this.app.waibuMpa

  if (!req.site) return
  const siteTheme = get(req, 'site.setting.waibuMpa.theme')
  req.theme = siteTheme ?? get(mpa, 'config.theme.set', 'default')
  const htheme = req.headers['x-theme']
  if (isString(htheme) && mpa.getTheme(htheme)) req.theme = htheme
  req.theme = req.theme ?? 'default'
}

export async function checkTeam (req, reply, route) {
  const { map } = this.app.lib._
  route.teams = route.teams ?? []
  if (route.teams.length === 0) return

  const teams = map(req.user.teams, 'alias')
  if (teams.includes('administrator')) return
  if (teams.length === 0) throw this.error('accessDenied', { statusCode: 403 })

  const paths = pathsToCheck.call(this, req, true)
  const allGuards = (await this.getRouteGuards()).filter(item => item.siteId === req.site.id + '' && item.teams.length > 0)
  if (allGuards.length === 0) return // no route to be team guarded
  let match = this.checkPathsByRoute({ paths, teams, guards: allGuards.filter(item => !item.inverse) })
  if (match) {
    const neg = this.checkPathsByRoute({ paths, teams, guards: allGuards.filter(item => item.inverse) })
    if (neg) match = undefined
  }
  if (!match) throw this.error('accessDenied', { statusCode: 403 })
  // passed
}

export async function checkUserId (req, reply, source) {
  const { merge, isEmpty, camelCase, get } = this.app.lib._
  const { routePath } = this.app.waibu
  const userId = get(req, 'session.userId')

  const setUser = async () => {
    if (!userId) return
    try {
      const user = await this.getUserById(userId, req)
      if (user) req.user = user
      else req.session.userId = null
    } catch (err) {
      console.log(err)
      req.session.userId = null
    }
  }

  if (req.session) req.session.siteId = req.site.id

  const webApp = get(req, 'routeOptions.config.webApp', 'waibu')
  if (!req.routeOptions.url) {
    if (!req.session) return
    await setUser()
    return
  }

  const paths = pathsToCheck.call(this, req)
  const allGuards = (await this.getRouteGuards()).filter(item => item.siteId === req.site.id + '')
  if (allGuards.length === 0) return false // no routes protected
  let securePath = await this.checkPathsByRoute({ paths, guards: allGuards.filter(item => !item.anonymous && !item.inverse) })
  if (securePath) {
    const neg = await this.checkPathsByRoute({ paths, guards: allGuards.filter(item => !item.anonymous && item.inverse) })
    if (neg) securePath = undefined
  }
  let anonymousPath = await this.checkPathsByRoute({ paths, guards: allGuards.filter(item => item.anonymous && !item.inverse) })
  if (anonymousPath) {
    const neg = await this.checkPathsByRoute({ paths, guards: allGuards.filter(item => item.anonymous && item.inverse) })
    if (neg) anonymousPath = undefined
  }
  if (!securePath && !anonymousPath) {
    if (userId) await setUser()
    return false // regular, unguarded path. Not secure & not anonymous path
  }
  if (anonymousPath) {
    if (!userId) return false
    req.session.ref = req.url
    return reply.redirectTo(routePath(this.config.redirect.signout))
  }
  if (!(securePath.methods ?? []).includes(req.method)) throw this.error('accessDenied', { statusCode: 403 })
  if (userId) {
    await setUser()
    return securePath
  }
  const silentOnError = this.config.auth[webApp].silentOnError ?? this.config.auth.common.silentOnError
  const payload = silentOnError ? { noContent: true } : undefined
  const authMethods = this.config.auth[webApp].methods ?? []
  if (isEmpty(authMethods)) throw this.error('noAuthMethod', merge({ statusCode: 500 }, payload))
  let success
  for (const m of authMethods) {
    const handler = this[camelCase(`verify ${m}`)]
    if (!handler) throw this.error('invalidAuthMethod%s', m, merge({ statusCode: 500 }, payload))
    const check = await handler(req, reply, source, payload)
    if (check) {
      success = check
      break
    }
  }
  if (!success) throw this.error('accessDeniedNoAuth', merge({ statusCode: 403 }, payload))
  return securePath
}

export async function latLngHook (body, options) {
  const { isSet } = this.app.lib.aneka
  const { round } = this.app.lib.aneka
  if (!isSet(body[options.field])) return
  body[options.field] = round(body[options.field], options.scale)
}

/**
 * If current route is an inter site route user is an inter site admin, then let it passed
 *
 * @param {Object} req - Request object
 * @param {Object} reply - Reply object
 * @returns
 */
export async function checkCrossSite (req, reply) {
  const { get } = this.app.lib._
  if (!get(req, 'routeOptions.config.crossSite')) return
  if (!get(req, 'user.crossSiteAdmin')) throw this.error('accessDenied', { statusCode: 403 })
}
