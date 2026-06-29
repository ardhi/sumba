import path from 'path'

async function hook () {
  return [{
    name: 'bajo.extend:afterReadConfig',
    handler: async function afterReadConfig (file, result, options) {
      const base = path.basename(file, path.extname(file))
      // rewrite fixtures
      if (!(base === 'route-guard' && Array.isArray(result) && file.includes('/fixture/'))) return
      for (const res of result) {
        if (res.path.slice(0, 2) === ':/') res.path = options.sourceNs + res.path
        res.path = res.path.replaceAll('{ns}', options.sourceNs)
      }
    }
  }, {
    name: ['dobo.sumbaAttribGuard:afterTransaction'],
    handler: async function (action, ...args) {
      if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
      await this.getAttribGuards(true)
    }
  }, {
    name: 'dobo.sumbaContactForm:afterCreateRecord',
    handler: async function afterCreateRecord (body, rec, options = {}) {
      const { data } = rec
      const { req } = options
      const { get } = this.app.lib._
      const t = get(req, 't', this.t)
      const to = `${data.firstName} ${data.lastName} <${data.email}>`
      let bcc
      if (req.site) bcc = req.site.email
      const subject = t('contactForm')
      const payload = { to, bcc, subject, data }
      await this.sendMail(
        'sumba.template:/_mail/help-contact-form.html',
        { payload, options, source: this.ns }
      )
    }
  }, {
    level: 1000,
    name: 'dobo.sumbaContactForm:beforeCreateRecord',
    handler: async function (body, options = {}) {
      const { get, isEmpty } = this.app.lib._
      const user = get(options, 'req.user')
      if (user) {
        if (isEmpty(body.firstName)) body.firstName = user.firstName
        if (isEmpty(body.lastName)) body.lastName = user.firstName
        if (isEmpty(body.email)) body.email = user.email
      }
      if (isEmpty(body.category)) body.category = 'MISC'
      options.checksumId = true
    }
  }, {
    name: ['dobo.sumbaQueryGuard:afterTransaction'],
    handler: async function (action, ...args) {
      if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
      await this.getQueryGuards(true)
    }
  }, {
    name: ['dobo.sumbaSecureGuard:afterTransaction'],
    handler: async function (action, ...args) {
      if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
      await this.getSecureGuards(true)
    }
  }, {
    name: ['dobo.sumbaActionGuard:afterTransaction'],
    handler: async function (action, ...args) {
      if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
      await this.getActionGuards(true)
    }
  }, {
    name: ['dobo.sumbaAnonymousGuard:afterTransaction'],
    handler: async function (action, ...args) {
      if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
      await this.getAnonymousGuards(true)
    }
  }, {
    name: 'dobo.sumbaSite:afterCreateRecord',
    handler: async function afterCreateRecord (body, result, options) {
      const fixtures = await this.getAllFixtures(result.data.alias)
      await this.createRefs(result.data, fixtures, options)
    }
  }, {
    name: 'dobo.sumbaSite:afterRemoveRecord',
    handler: async function afterRemoveRecord (id, result, options) {
      await this.removeRefs(result.oldData, options)
      await this.clearCacheSite(id, result)
    }
  }, {
    name: 'dobo.sumbaSite:afterUpdateRecord',
    handler: async function (id, input, result, opts) {
      await this.clearCacheSite(id, result)
    }
  }, {
    name: ['dobo.sumbaTeam:afterTransaction', 'dobo.sumbaSite:afterTransaction'],
    handler: async function (action, ...args) {
      if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
      await this.getSecureGuards(true)
      await this.getQueryGuards(true)
      await this.getActionGuards(true)
      await this.getAttribGuards(true)
    }
  }, {
    name: 'dobo.sumbaUser:afterCreateRecord',
    handler: async function (body, rec, options = {}) {
      const { data } = rec
      const { req } = options
      const { get } = this.app.lib._
      const t = get(req, 't', this.t)
      const to = `${data.firstName} ${data.lastName} <${data.email}>`
      const subject = t('newUserSignup')
      const payload = { to, subject, data }
      await this.sendMail(
        `sumba.template:/_mail/user-signup-success${data.status === 'ACTIVE' ? '-active' : ''}.html`,
        { payload, options, source: this.ns }
      )
    }
  }, {
    name: 'dobo.sumbaUser:afterRemoveRecord',
    handler: async function (id, rec, options = {}) {
      await this.clearCacheUser(id, rec)
    }
  }, {
    name: 'dobo.sumbaUser:afterUpdateRecord',
    handler: async function (id, body, rec, options = {}) {
      const { data, oldData } = rec
      const { req } = options
      const { get } = this.app.lib._
      const t = get(req, 't', this.t)
      const to = `${data.firstName} ${data.lastName} <${data.email}>`
      const source = this.ns

      await this.clearCacheUser(id, rec)

      let subject
      const payload = { to, subject, data }

      if (oldData.status === 'UNVERIFIED' && data.status === 'ACTIVE') {
        payload.subject = t('userActivation')
        await this.sendMail(
          'sumba.template:/_mail/user-activation-success.html',
          { payload, options, source }
        )
      } else if (oldData.token !== data.token) {
        payload.subject = t('resetApiKey')
        await this.sendMail(
          'sumba.template:/_mail/mystuff-reset-api-key.html',
          { payload, options, source }
        )
      } else if (body.password) {
        payload.subject = t('changePassword')
        await this.sendMail(
          'sumba.template:/_mail/mystuff-change-password.html',
          { payload, options, source }
        )
      }
    }
  }, {
    level: 1000,
    name: 'dobo.driver:beforeAny',
    handler: async function (model, options) {
      await this.applyActionHook({ model, options })
    }
  }, {
    level: 1000,
    name: 'dobo.driver:beforeCreateRecord',
    handler: async function (model, body, options = {}) {
      const { get } = this.app.lib._
      const { isSet } = this.app.lib.aneka
      const { req } = options
      if (options.noAutoFilter || !req || get(req, 'routeOptions.config.xSite')) return
      const item = { siteId: 'site.id', userId: 'user.id' }
      for (const i in item) {
        const rec = get(req, item[i])
        const field = model.getProperty(i)
        if (rec && field && !isSet(body[i])) body[i] = field.type === 'string' ? (rec + '') : rec
      }
    }
  }, {
    level: 1000,
    name: ['dobo.driver:beforeFindRecord', 'dobo.driver:beforeFindAllRecord', 'dobo.driver:beforeCountRecord'],
    handler: async function handler (model, filter, options = {}) {
      const { isEmpty } = this.app.lib._
      const { req = {} } = options
      if (options.noAutoFilter || isEmpty(req) || isEmpty(req.site)) return
      await this.rebuildFilter(model, filter, options)
    }
  }, {
    level: 1000,
    name: ['dobo.driver:beforeGetRecord', 'dobo.driver:beforeRemoveRecord', 'dobo.driver:beforeUpdateRecord'],
    handler: async function (model, id, options) {
      await this.applyQueryHook(model, id, options)
    }
  }, {
    name: 'waibuMpa.sumba:afterBuildLocals',
    handler: async function (locals, req) {
      const { routePath } = this.app.waibu
      const items = []
      if (req.user) {
        items.push({ icon: 'person', 't:tooltip': 'yourProfile', href: routePath('sumba:/your-stuff/profile') })
        items.push({ icon: 'key', 't:tooltip': 'changePassword', href: routePath('sumba:/your-stuff/change-password') })
        items.push({ component: 'navItemSignout', 't:tooltip': 'signout', bottom: true })
      } else {
        items.push({ icon: 'signin', 't:tooltip': 'signin', href: routePath('sumba:/signin') })
        items.push({ icon: 'key', 't:tooltip': 'forgotPassword', href: routePath('sumba:/user/forgot-password') })
        items.push({ icon: 'personAdd', 't:tooltip': 'newUserSignup', href: routePath('sumba:/user/signup') })
      }
      items.push({ divider: true })
      items.push({ icon: 'envelope', 't:tooltip': 'contactForm', href: routePath('sumba:/help/contact-form') })
      items.push({ icon: 'chat', 't:tooltip': 'troubleTickets', href: routePath('sumba:/help/trouble-tickets') })
      locals.sidebar = items
    }
  }, {
    level: 10,
    name: 'waibuMpa:preParsing',
    handler: async function (req, reply) {
      const secure = await this.checkUser(req, reply, 'waibuMpa')
      if (!secure) return
      await this.checkTeam(req, reply)
      await this.checkXSite(req, reply)
    }
  }, {
    level: 10,
    name: 'waibuRestApi:preParsing',
    handler: async function (req, reply) {
      const secure = await this.checkUser(req, reply, 'waibuRestApi')
      if (!secure) return
      await this.checkTeam(req, reply)
      await this.checkXSite(req, reply)
    }
  }, {
    level: 10,
    name: 'waibuStatic:preParsing',
    handler: async function (req, reply) {
      const secure = await this.checkUser(req, reply, 'waibuStatic')
      if (!secure) return
      await this.checkTeam(req, reply)
      await this.checkXSite(req, reply)
    }
  }, {
    name: 'waibu:afterAppBoot',
    handler: async function () {
      await this.getAnonymousGuards(true)
      await this.getSecureGuards(true)
      await this.getQueryGuards(true)
      await this.getActionGuards(true)
      await this.getAttribGuards(true)
    }
  }, {
    name: 'waibu:afterCreateContext',
    handler: async function (ctx) {
      ctx.decorateRequest('user', null)
    }
  }, {
    level: 10,
    name: 'waibu:preParsing',
    handler: async function (req, reply) {
      const { getHostname } = this.app.waibu
      req.site = await this.getSite(getHostname(req))
      await this.checkRoute(req)
      await this.checkTheme(req, reply) // TODO: only check if webApp support it
      await this.checkIconset(req, reply) // TODO: s.a.
    }
  }, {
    name: 'waibu:beforeStart',
    handler: async function () {
      if (this.app.sumba.config.multiSite.enabled) return
      const routes = ['waibuAdmin:/site/x/site/*']
      this.app.waibu.config.route.disabled.push(...routes)
    }
  }]
}

export default hook
