export function pathsToCheck (req, withHome) {
  const { uniq, without } = this.app.bajo.lib._
  const checks = uniq(without([req.routeOptions.url, req.url], undefined, null))
  /*
  if (withHome) {
    const homePath = get(this, 'app.waibu.config.home.path')
    const homeForward = get(this, 'app.waibu.config.home.forward')
    if (homePath && homeForward) checks.unshift('/')
  }
  */
  return checks
}

async function setUser (req) {
  const { get } = this.app.bajo.lib._
  const id = get(req, 'session.user.id')
  if (!id) return
  try {
    const user = await this.getUser(id)
    if (user) req.user = user
    else req.session.user = null
  } catch (err) {
    req.session.user = null
  }
}

async function mergeSetting (req) {
  req.user.setting = {}
}

async function checkUserId (req, reply, source) {
  const { isEmpty, camelCase } = this.app.bajo.lib._
  const { routePath } = this.app.waibu

  const ctx = this.app[source].instance
  if (!req.routeOptions.url) {
    if (!req.session) return
    await setUser.call(this, req)
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
    if (req.session && req.session.user) await setUser.call(this, req)
    return
  }
  if (anonymousPath) {
    if (!req.session) return // can't check, so don't care
    if (!req.session.user) return // not authenticated, why bother
    req.session.ref = req.url
    return reply.redirectTo(routePath(this.config.redirect.signout))
  }
  if (securePath) {
    if (req.session && req.session.user) {
      await setUser.call(this, req)
      return
    }
    const authMethods = this.config.auth[securePath.source].methods ?? []
    if (isEmpty(authMethods)) throw this.error('noAuthMethod', { statusCode: 500 })
    let success
    for (const m of authMethods) {
      const handler = this[camelCase(`verify ${m}`)]
      if (!handler) throw this.error('invalidAuthMethod%s', m, { statusCode: 500 })
      const check = await handler(req, reply, source, ctx)
      if (check) {
        success = check
        break
      }
    }
    if (!success) throw this.error('accessDenied', { statusCode: 403 })
    await mergeSetting.call(this, req)
  }
}

export default checkUserId
