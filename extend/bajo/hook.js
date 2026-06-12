import { removeRefs } from '../../lib/remove-site.js'
import { getAllFixtures, createRefs } from '../../lib/create-new-site.js'
import path from 'path'

async function clearCacheSite (id, result) {
  if (!this.app.bajoCache) return
  const { clear } = this.app.bajoCache ?? {}
  const { get } = this.app.lib._
  await clear({ key: 'dobo|SumbaSite|getSite|default' })
  await clear({ key: `dobo|SumbaSite|getSite|multiSite|${id}` })
  await clear({ key: `dobo|SumbaSite|getSite|multiSite|${get(result, 'data.hostname', get(result, 'oldData.hostname'))}` })
}

async function clearCacheUser (id, result) {
  if (!this.app.bajoCache) return
  const { clear } = this.app.bajoCache ?? {}
  const { get } = this.app.lib._
  const token = get(result, 'data.token', get(result, 'oldData.token', ''))
  await clear({ key: `dobo|SumbaUser|getUserById|${id}` })
  await clear({ key: `dobo|SumbaUser|getUserByToken|${token}` })
}

async function applyModelGuard ({ model, q, teamIds, options }) {
  const { set, orderBy } = this.app.lib._
  const { includes } = this.app.lib.aneka
  const { sanitizeByType } = this.app.dobo
  const { req } = options
  const results = []

  const guards = await this.getModelGuards()
  const fields = model.getNonVirtualProperties().map(prop => prop.name)
  const filterFn = item => {
    const bySiteId = item.siteId === req.site.id + ''
    const byModel = item.models.includes(model.name)
    const byFields = fields.includes(item.field)
    return bySiteId && byModel && byFields
  }

  const rules = orderBy(guards.filter(filterFn), ['field'])
  for (const field of fields) {
    if (!model.getNonVirtualProperties(true).includes(field)) continue // or, should it throws exception instead?
    const prop = model.getProperty(field)
    const items = rules.filter(item => item.field === field)
    for (const item of items) {
      const values = item.value.map(val => {
        return sanitizeByType(val, prop.type, { strict: true, inputFormat: 'string', model: model.name })
      })
      const op = item.condition.toLowerCase()
      let value
      if (['in', 'nin'].includes(op)) value = set({}, '$' + op, values)
      else if (op === 'between') value = { $gte: values[0], $lte: values[1] }
      else value = set({}, '$' + op, values[0])
      const teamOk = item.allTeams ? true : (item.teamIds.length === 0 ? false : includes(item.teamIds, teamIds))
      if (!teamOk) throw this.error('_abortAction')
      results.push(set({}, field, value))
    }
  }
  q.$and.push(...results)
}

export async function applyAttribGuard ({ model, teamIds, options }) {
  const { uniq } = this.app.lib._
  const { includes } = this.app.lib.aneka
  const { req } = options
  const results = []

  const guards = await this.getAttribGuards()
  const filterFn = item => {
    const bySiteId = item.siteId === req.site.id + ''
    const byModel = item.models.includes(model.name)
    const byTeamId = item.allTeams ? true : includes(item.teamIds, teamIds)
    return bySiteId && byModel && byTeamId
  }
  guards.filter(filterFn).forEach(item => results.push(...item.hiddenFields))
  options.hidden = options.hidden ?? []
  options.hidden.push(...results)
  options.hidden = uniq(options.hidden)
}

async function rebuildFilter (model, filter = {}, options = {}) {
  const { isEmpty, get } = this.app.lib._
  const { req } = options
  const allowEmpty = !get(this, `app.${model.ns}.config.sumba.noEmptyQuery`, []).includes(model.name)
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
  if (req.routeOptions.config.xSite) {
    filter.query = q
    return
  }
  if (hasSiteId) q.$and.push({ siteId: req.site.id + '' })
  if (aliases.includes('administrator')) {
    filter.query = q
    return
  }
  if (isEmpty(req.user)) {
    if (q.$and.length === 0 && !allowEmpty) throw this.error('_emptyColumnQuery')
    filter.query = q
    return
  }

  const condUserId = {
    $or: [
      { userId: req.user.id + '' },
      { userId: { $eq: null } }
    ]
  }

  const condTeamId = {
    $or: [
      { teamId: { $in: teamIds } },
      { teamId: { $eq: null } }
    ]
  }

  if (hasTeamId) {
    if (hasUserId) q.$and.push({ $or: [condTeamId, condUserId] })
    else q.$and.push(condTeamId)
  } else if (hasUserId) q.$and.push(condUserId)

  await applyModelGuard.call(this, { model, q, teamIds, options, allowEmpty })
  await applyAttribGuard.call(this, { model, teamIds, options })
  if (q.$and.length === 0 && !allowEmpty) throw this.error('_emptyColumnQuery')
  filter.query = q
}

async function checker (model, id, options = {}) {
  const { isEmpty } = this.app.lib._
  const { req = {} } = options
  if (options.noAutoFilter || isEmpty(req) || isEmpty(req.site)) return

  const filter = {}
  await rebuildFilter.call(this, model, filter, options)
  if (filter.query.$and) filter.query.$and.push({ id })
  else filter.query.id = id
  const row = await model.findOneRecord(filter, { count: false })
  if (!row) throw this.app.dobo.error('recordNotFound%s%s', id, this.name, { statusCode: 404 })
}

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
    name: ['dobo.sumbaModelGuard:afterTransaction'],
    handler: async function (action, ...args) {
      if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
      await this.getModelGuards(true)
    }
  }, {
    name: ['dobo.sumbaSecureGuard:afterTransaction'],
    handler: async function (action, ...args) {
      if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
      await this.getSecureGuards(true)
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
      const fixtures = await getAllFixtures.call(this, result.data.alias)
      await createRefs.call(this, result.data, fixtures, options)
    }
  }, {
    name: 'dobo.sumbaSite:afterRemoveRecord',
    handler: async function afterRemoveRecord (id, result, options) {
      await removeRefs.call(this, result.oldData, options)
      await clearCacheSite.call(this, id, result)
    }
  }, {
    name: 'dobo.sumbaSite:afterUpdateRecord',
    handler: async function (id, input, result, opts) {
      await clearCacheSite.call(this, id, result)
    }
  }, {
    name: ['dobo.sumbaTeam:afterTransaction', 'dobo.sumbaSite:afterTransaction'],
    handler: async function (action, ...args) {
      if (!['createRecord', 'updateRecord', 'removeRecord'].includes(action)) return
      await this.getSecureGuards(true)
      await this.getModelGuards(true)
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
      await clearCacheUser.call(this, id, rec)
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

      await clearCacheUser.call(this, id, rec)

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
      await rebuildFilter.call(this, model, filter, options)
    }
  }, {
    level: 1000,
    name: ['dobo.driver:beforeGetRecord', 'dobo.driver:beforeRemoveRecord', 'dobo.driver:beforeUpdateRecord'],
    handler: async function (model, id, options) {
      await checker.call(this, model, id, options)
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
      await this.checkTheme(req, reply)
      await this.checkIconset(req, reply)
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
      await this.getModelGuards(true)
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
