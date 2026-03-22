export const checkNoRouteSettingKey = 'setting.waibu.noRoutes.$in'

export function parseNsSettings (ns, setting, items) {
  const { trim, set, isPlainObject, isArray, isEmpty, find, get, isString } = this.app.lib._
  const { parseObject, dayjs } = this.app.lib
  const { routePath } = this.app.waibu

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
  const key = checkNoRouteSettingKey.slice(checkNoRouteSettingKey.indexOf('.') + 1)
  let noRoutes = get(setting, key, [])
  if (noRoutes.length > 0) {
    noRoutes = noRoutes.map(item => {
      if (!isString(item)) return item
      let [url, methods] = item.split('|')
      if (methods === '*' || !methods) methods = 'GET,POST,PUT,DELETE'
      methods = methods.split(',').map(m => m.trim().toUpperCase())
      return { url: routePath(url), methods }
    })
    set(setting, key, noRoutes)
  }
}

export function checkNoRouteSetting (req, routes) {
  const { isEmpty } = this.app.lib._
  const { outmatch } = this.app.lib
  if (isEmpty(routes)) return
  for (const route of routes) {
    const isMatchUrl = outmatch(route.url)
    if (isMatchUrl(req.url) || isMatchUrl(req.routeOptions.url)) {
      if (route.methods.includes(req.method)) throw this.error('accessDenied', { statusCode: 403 })
    }
  }
}

export function pathsToCheck (req, withHome) {
  const { uniq, without } = this.app.lib._
  return uniq(without([req.routeOptions.url, req.url], undefined, null))
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

export async function checkTeam (req, reply, source) {
  const { get, isEmpty } = this.app.lib._
  if (!req.user) return
  const { map } = this.app.lib._
  const paths = pathsToCheck.call(this, req, true)
  const teams = map(req.user.teams, 'alias')
  let match = this.checkPathsByTeam({ paths, method: req.method, teams, guards: this.teamRoutes })
  if (!match) match = this.checkPathsByTeam({ paths, method: req.method, teams, guards: this.teamNegRoutes })
  if (!match) {
    const guards = map(this.teamRoutes, 'path')
    match = !this.checkPathsByGuard({ paths, guards })
  }
  if (!match) throw this.error('accessDenied', { statusCode: 403 })
  const routes = []
  for (const team of (req.user.teams ?? [])) {
    const items = get(team, checkNoRouteSettingKey, [])
    if (isEmpty(items)) continue
    routes.push(...items)
  }
  checkNoRouteSetting.call(this, req, routes)
}

export async function checkUserId (req, reply, source) {
  const { merge, isEmpty, camelCase, get } = this.app.lib._
  const { routePath } = this.app.waibu
  const userId = get(req, 'session.userId')

  const setUser = async () => {
    const id = get(req, 'session.userId')
    if (!id) return
    try {
      const user = await this.getUser(id)
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
  let securePath = await this.checkPathsByRoute({ paths, method: req.method, guards: this.secureRoutes })
  if (securePath) {
    const neg = await this.checkPathsByRoute({ paths, method: req.method, guards: this.secureNegRoutes })
    if (neg) securePath = undefined
  }
  let anonymousPath = await this.checkPathsByRoute({ paths, method: req.method, guards: this.anonymousRoutes })
  if (anonymousPath) {
    const neg = await this.checkPathsByRoute({ paths, method: req.method, guards: this.anonymousNegRoutes })
    if (neg) anonymousPath = undefined
  }
  if (!securePath && !anonymousPath) {
    if (userId) await setUser()
    return
  }
  if (anonymousPath) {
    if (!userId) return
    req.session.ref = req.url
    return reply.redirectTo(routePath(this.config.redirect.signout))
  }
  if (securePath) {
    if (userId) {
      await setUser()
      return
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
  }
}
