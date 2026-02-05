import path from 'path'

/**
 * Plugin factory
 *
 * @param {string} pkgName - NPM package name
 * @returns {class}
 */
async function factory (pkgName) {
  const me = this

  /**
   * Sumba class
   *
   * @class
   */
  class Sumba extends this.app.baseClass.Base {
    constructor () {
      super(pkgName, me.app)
      this.config = {
        multiSite: false,
        waibu: {
          title: 'site',
          prefix: 'site'
        },
        waibuMpa: {
          home: 'sumba:/your-stuff/profile',
          icon: 'globe',
          redirect: {
            '/': 'sumba:/your-stuff/profile',
            '/your-stuff': 'sumba:/your-stuff/profile',
            '/info': 'sumba:/info/about-us',
            '/user': 'sumba:/your-stuff/profile',
            '/db/export': 'sumba:/db/export/list',
            '/help': 'sumba:/help/contact-form',
            '/help/trouble-tickets': 'sumba:/help/trouble-tickets/list'
          },
          menuHandler: [{
            title: 'account',
            icon: 'person',
            level: 9998,
            children: [
              // anonymous only
              { title: 'signin', href: 'sumba:/signin', visible: 'anon' },
              { title: 'forgotPassword', href: 'sumba:/user/forgot-password', visible: 'anon' },
              { title: 'newUserSignup', href: 'sumba:/user/signup', visible: 'anon' },
              { title: '-', visible: 'anon' },
              { title: 'activation', href: 'sumba:/user/activation', visible: 'anon' },
              // authenticated only
              { title: 'yourProfile', href: 'sumba:/your-stuff/profile', visible: 'auth' },
              { title: 'changePassword', href: 'sumba:/your-stuff/change-password', visible: 'auth' },
              { title: 'downloadList', href: 'sumba:/your-stuff/download/list', visible: 'auth' },
              { title: '-', visible: 'auth' },
              { title: 'signout', href: 'sumba:/signout', visible: 'auth' }
            ]
          }, {
            title: 'help',
            icon: 'signInfo',
            level: 9999,
            children: [
              { title: 'contactForm', href: 'sumba:/help/contact-form' },
              { title: 'troubleTickets', href: 'sumba:/help/trouble-tickets', visible: 'auth' },
              { title: '-' },
              { title: 'cookiePolicy', href: 'sumba:/info/cookie-policy' },
              { title: 'privacy', href: 'sumba:/info/privacy' },
              { title: 'termsConditions', href: 'sumba:/info/terms-conditions' }
            ]
          }]
        },
        waibuAdmin: {
          menuHandler: 'sumba:adminMenu',
          menuCollapsible: true,
          modelDisabled: 'all'
        },
        auth: {
          common: {
            apiKey: {
              type: 'Bearer',
              qsKey: 'apiKey',
              headerKey: 'X-Sumba-ApiKey'
            },
            basic: {
            },
            jwt: {
              type: 'Bearer',
              qsKey: 'token',
              headerKey: 'X-Sumba-Token',
              secret: '668de9cf57316c7dbf52f7ff7611c299',
              expiresIn: 604800000
            }
          },
          waibuRestApi: {
            methods: ['basic', 'apiKey', 'jwt'],
            silentOnError: false
          },
          waibuMpa: {
            methods: ['session'],
            silentOnError: false
          },
          waibuStatic: {
            methods: ['basic', 'apiKey', 'jwt'],
            basic: {
              useUtf8: true,
              realm: 'Protected Area',
              warningMessage: 'Please authenticate yourself, thank you!'
            },
            silentOnError: false
          }
        },
        redirect: {
          signin: 'sumba:/signin',
          afterSignin: '/',
          signout: 'sumba:/signout',
          afterSignout: '/'
        },
        siteSetting: {
          forgotPasswordExpDur: '5m',
          userPassword: {
            minUppercase: 1,
            minLowercase: 1,
            minSpecialChar: 1,
            minNumeric: 1,
            noWhitespace: false,
            latinOnlyChars: false
          }
        }
      }
      this.unsafeUserFields = ['password']
    }

    init = async () => {
      const { getPluginDataDir } = this.app.bajo
      this.downloadDir = `${getPluginDataDir(this.ns)}/download`
      this.app.lib.fs.ensureDirSync(this.downloadDir)
      for (const type of ['secure', 'anonymous', 'team']) {
        this[`${type}Routes`] = this[`${type}Routes`] ?? []
        this[`${type}NegRoutes`] = this[`${type}NegRoutes`] ?? []
      }
    }

    _getSetting = async (type, source) => {
      const { defaultsDeep } = this.app.lib.aneka
      const { get } = this.app.lib._

      const setting = defaultsDeep(get(this.config, `auth.${source}.${type}`, {}), get(this.config, `auth.common.${type}`, {}))
      if (type === 'basic') setting.type = 'Basic'
      return setting
    }

    _getToken = async (type, req, source) => {
      const { isEmpty } = this.app.lib._

      const setting = await this._getSetting(type, source)
      let token = req.headers[setting.headerKey.toLowerCase()]
      if (!['basic'].includes(type) && isEmpty(token)) token = req.query[setting.qsKey]
      if (isEmpty(token)) {
        const parts = (req.headers.authorization || '').split(' ')
        if (parts[0] === setting.type) token = parts[1]
      }
      if (isEmpty(token)) return false
      return token
    }

    adminMenu = async (locals, req) => {
      if (!this.app.waibuAdmin) return
      const { getPluginPrefix } = this.app.waibu
      const prefix = getPluginPrefix(this.ns)
      return [{
        title: 'supportSystem',
        children: [
          { title: 'contactForm', href: `waibuAdmin:/${prefix}/contact-form/list` },
          { title: 'contactFormCat', href: `waibuAdmin:/${prefix}/contact-form-cat/list` },
          { title: 'ticket', href: `waibuAdmin:/${prefix}/ticket/list` },
          { title: 'ticketCat', href: `waibuAdmin:/${prefix}/ticket-cat/list` }
        ]
      }, {
        title: 'management',
        children: [
          { title: 'manageSite', href: `waibuAdmin:/${prefix}/site` },
          { title: 'manageUser', href: `waibuAdmin:/${prefix}/user/list` },
          { title: 'manageTeam', href: `waibuAdmin:/${prefix}/team/list` },
          { title: 'manageTeamUser', href: `waibuAdmin:/${prefix}/team-user/list` },
          { title: 'manageDownload', href: `waibuAdmin:/${prefix}/download/list` },
          { title: 'resetUserPassword', href: `waibuAdmin:/${prefix}/reset-user-password` }
        ]
      }, {
        title: 'misc',
        children: [
          { title: 'userSession', href: `waibuAdmin:/${prefix}/session/list` }
        ]
      }]
    }

    getUser = async (rec, safe = true) => {
      const { omit, isPlainObject } = this.app.lib._
      let user
      if (isPlainObject(rec)) user = rec
      else {
        const mdl = this.app.dobo.getModel('SumbaUser')
        user = await mdl.getRecord(rec, { noHook: true, throwNotFound: false })
      }
      if (!user) return null
      return safe ? omit(user, this.unsafeUserFields) : user
    }

    mergeTeam = async (user, site) => {
      if (!user) return
      const { map, pick } = this.app.lib._
      user.teams = []
      const query = { userId: user.id, siteId: site.id }
      let mdl = this.app.dobo.getModel('SumbaTeamUser')
      const userTeam = await mdl.findAllRecord({ query })
      if (userTeam.length === 0) return
      delete query.userId
      query.id = { $in: map(userTeam, 'id') }
      query.status = 'ENABLED'
      mdl = this.app.dobo.getModel('SumbaTeam')
      const team = await mdl.findAllRecord({ query })
      if (team.length > 0) user.teams.push(...map(team, t => pick(t, ['id', 'alias'])))
    }

    getUserFromUsernamePassword = async (username = '', password = '', req) => {
      const { importPkg } = this.app.bajo
      const model = this.app.dobo.getModel('SumbaUser')
      await model.validate({ username, password }, null, { partial: true, ns: ['sumba', 'dobo'], fields: ['username', 'password'] })
      const bcrypt = await importPkg('bajoExtra:bcrypt')

      const query = { username, provider: 'local' }
      const rows = await model.findRecord({ query }, { req, forceNoHidden: true, noHook: true })
      if (rows.length === 0) throw this.error('validationError', { details: [{ field: 'username', error: 'Unknown username' }], statusCode: 401 })
      const rec = rows[0]
      if (rec.status !== 'ACTIVE') throw this.error('validationError', { details: ['User is inactive or temporarily disabled'], statusCode: 401 })
      const verified = await bcrypt.compare(password, rec.password)
      if (!verified) throw this.error('validationError', { details: [{ field: 'password', error: 'invalidPassword' }], statusCode: 401 })
      return rec
    }

    createJwtFromUserRecord = async (rec) => {
      const { importPkg } = this.app.bajo
      const { dayjs } = this.app.lib
      const { hash } = this.app.bajoExtra
      const { get, pick } = this.app.lib._

      const fastJwt = await importPkg('bajoExtra:fast-jwt')
      const { createSigner } = fastJwt

      const opts = pick(this.config.auth.common.jwt, ['expiresIn'])
      opts.key = get(this.config, 'auth.common.jwt.secret')
      const sign = createSigner(opts)
      const apiKey = await hash(rec.password)
      const payload = { uid: rec.id, apiKey }
      const token = await sign(payload)
      const expiresAt = dayjs().add(opts.expiresIn).toDate()
      return { token, expiresAt }
    }

    verifySession = async (req, reply, source, payload) => {
      const { getUser } = this
      const { routePath } = this.app.waibu

      if (!req.session) return false
      if (req.session.userId) {
        req.user = await getUser(req.session.userId)
        return true
      }
      const redir = routePath(this.config.redirect.signin, req)
      req.session.ref = req.url
      throw this.error('_redirect', { redirect: redir })
    }

    verifyApiKey = async (req, reply, source, payload) => {
      const { merge } = this.app.lib._
      const { isMd5, hash } = this.app.bajoExtra
      const { getUser } = this

      let token = await this._getToken('apiKey', req, source)
      if (!isMd5(token)) return false
      token = await hash(token)
      const query = { token }
      const rows = await this.app.dobo.getModel('SumbaUser').findRecord({ query }, { req, noHook: true })
      if (rows.length === 0) throw this.error('invalidKey', merge({ statusCode: 401 }, payload))
      if (rows[0].status !== 'ACTIVE') throw this.error('userInactive', merge({ details: [{ field: 'status', error: 'inactive' }], statusCode: 401 }, payload))
      req.user = await getUser(rows[0])
      return true
    }

    verifyBasic = async (req, reply, source, payload) => {
      const { getUserFromUsernamePassword } = this
      const { getUser } = this
      const { isEmpty, merge } = this.app.lib._

      const setHeader = async (setting, reply) => {
        const { isString } = this.app.lib._

        let header = setting.type
        const exts = []
        if (isString(setting.realm)) exts.push(`realm="${setting.realm}"`)
        if (setting.useUtf8) exts.push('charset="UTF-8"')
        if (exts.length > 0) header += ` ${exts.join(', ')}`
        reply.header('WWW-Authenticate', header)
        reply.code(401)
      }

      const setting = await this._getSetting('basic', source)
      let authInfo
      const parts = (req.headers.authorization ?? '').split(' ')
      if (parts[0] === setting.type) authInfo = parts[1]
      if (isEmpty(authInfo)) {
        if (setting.realm) {
          await setHeader(setting, reply)
          throw this.error(setting.warningMessage)
        } else return false
      }
      const decoded = Buffer.from(authInfo, 'base64').toString()
      const [username, password] = decoded.split(':')
      try {
        const user = await getUserFromUsernamePassword(username, password, req)
        req.user = await getUser(user)
      } catch (err) {
        if (err.statusCode === 401 && setting.realm) {
          await setHeader(setting, reply)
          return err.message
        }
        throw merge(err, payload)
      }
      return true
    }

    verifyJwt = async (req, reply, source, payload) => {
      const { importPkg } = this.app.bajo
      const { getUser } = this
      const { isEmpty, merge } = this.app.lib._

      const fastJwt = await importPkg('bajoExtra:fast-jwt')
      const { createVerifier } = fastJwt
      const setting = await this._getSetting('jwt', source)
      const token = await this._getToken('jwt', req, source)
      if (isEmpty(token)) return false
      const verifier = createVerifier({
        key: setting.secret,
        complete: true
      })
      const decoded = await verifier(token)
      const id = decoded.payload.uid
      try {
        const rec = await this.app.dobo.getModel('SumbaUser').getRecord(id, { req, noHook: true })
        if (!rec) throw this.error('invalidToken', { statusCode: 401 })
        if (rec.status !== 'ACTIVE') throw this.error('userInactive', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
        req.user = await getUser(rec)
      } catch (err) {
        merge(err, payload)
        throw err
      }
      return true
    }

    checkPathsByTeam = ({ paths = [], method = 'GET', teams = [], guards = [] }) => {
      const { includes } = this.app.lib.aneka
      const { outmatch } = this.app.lib

      for (const item of guards) {
        const matchPath = outmatch(item.path)
        for (const path of paths) {
          if (matchPath(path)) {
            const matchMethods = outmatch(item.methods, { separator: false })
            if (matchMethods(method)) {
              if (item.teams.length === 0) return item
              if (includes(teams, item.teams)) return item
            }
          }
        }
      }
    }

    checkPathsByRoute = ({ paths = [], method = 'GET', guards = [] }) => {
      const { outmatch } = this.app.lib

      for (const item of guards) {
        const matchPath = outmatch(item.path)
        for (const path of paths) {
          if (matchPath(path)) {
            const matchMethods = outmatch(item.methods, { separator: false })
            if (matchMethods(method)) return item
          }
        }
      }
    }

    checkPathsByGuard = ({ guards, paths }) => {
      const { outmatch } = this.app.lib
      const matcher = outmatch(guards)
      let guarded
      for (const path of paths) {
        if (!guarded) guarded = matcher(path)
      }
      return guarded
    }

    getSite = async (hostname, useId) => {
      const { omit } = this.app.lib._
      const omitted = ['status']

      const mergeSetting = async (site) => {
        const { defaultsDeep } = this.app.lib.aneka
        const { parseObject } = this.app.lib
        const { trim, get, filter } = this.app.lib._
        const defSetting = {}
        const nsSetting = {}
        const names = this.app.getAllNs()
        const query = {
          ns: { $in: names },
          siteId: site.id
        }
        const all = await this.app.dobo.getModel('SumbaSiteSetting').findRecord({ query, limit: -1 })
        for (const ns of names) {
          nsSetting[ns] = {}
          defSetting[ns] = get(this, `app.${ns}.config.siteSetting`, {})
          const items = filter(all, { ns })
          for (const item of items) {
            let value = trim([item.value] ?? '')
            if (['[', '{'].includes(value[0])) value = JSON.parse(value)
            else if (Number(value)) value = Number(value)
            else if (['true', 'false'].includes(value)) value = value === 'true'
            nsSetting[ns][item.key] = value
          }
        }
        site.setting = parseObject(defaultsDeep({}, nsSetting, defSetting))
        // additional fields
        const country = await this.app.dobo.getModel('CdbCountry').getRecord(site.country, { noHook: true })
        site.countryName = (country ?? {}).name ?? site.country
      }

      let site = {}

      if (!this.config.multiSite) {
        const resp = await this.app.dobo.getModel('SumbaSite').findRecord({ query: { alias: 'default' } }, { noHook: true })
        site = omit(resp[0], omitted)
        await mergeSetting(site)
        return site
      }
      let query
      if (useId) query = { id: hostname }
      else {
        query = {
          $or: [
            { hostname },
            { alias: hostname }
          ]
        }
      }
      const filter = { query, limit: 1 }
      const rows = await this.app.dobo.getModel('SumbaSite').findRecord(filter, { noHook: true })
      if (rows.length === 0) throw this.error('unknownSite')
      const row = omit(rows[0], omitted)
      if (row.status !== 'ACTIVE') throw this.error('siteInactiveInfo')
      site = row
      await mergeSetting(site)
      return site
    }

    signout = async ({ req, reply, reason }) => {
      const { runHook } = this.app.bajo
      const { getSessionId } = this.app.waibuMpa
      const sid = await getSessionId(req.headers.cookie)
      req.session.userId = null
      await runHook(`${this.ns}:afterSignout`, sid, req)
      const { query, params } = req
      // const url = !isEmpty(referer) ? referer : this.config.redirect.home
      const url = this.config.redirect.afterSignout
      req.flash('notify', req.t(reason ?? 'signoutSuccessfully'))
      return reply.redirectTo(url, { query, params })
    }

    signin = async ({ user, req, reply }) => {
      const { getSessionId } = this.app.waibuMpa
      const { runHook } = this.app.bajo
      const { isEmpty, omit } = this.app.lib._
      let { referer } = req.body || {}
      if (req.session.ref) referer = req.session.ref
      req.session.ref = null
      const _user = omit(user, ['password', 'token'])
      req.session.userId = _user.id
      const sid = await getSessionId(req.headers.cookie)
      await runHook(`${this.ns}:afterSignin`, _user, sid, req)
      const { query, params } = req
      const url = !isEmpty(referer) ? referer : this.config.redirect.afterSignin
      req.flash('notify', req.t('signinSuccessfully'))
      return reply.redirectTo(url, { query, params })
    }

    generatePassword = (req) => {
      const { generateId } = this.app.lib.aneka
      const cfg = req ? req.site.setting.sumba.userPassword : this.config.siteSetting.userPassword
      let passwd = generateId()
      if (cfg.minLowercase) passwd += generateId({ pattern: 'abcdefghijklmnopqrstuvwxyz', length: cfg.minLowercase })
      if (cfg.minUppercase) passwd += generateId({ pattern: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', length: cfg.minUppercase })
      if (cfg.minSpecialChar) passwd += generateId({ pattern: '!@#$%*', length: cfg.minSpecialChar })
      if (cfg.minNumeric) passwd += generateId({ pattern: '0123456789', length: cfg.minNumeric })
      return passwd
    }

    pushDownload = async ({ description, worker, data, source, req, file, type }) => {
      const { getPlugin } = this.app.bajo
      const { createRecord } = getPlugin('waibuDb')
      const { push } = getPlugin('bajoQueue')
      description = description ?? file
      const jobQueue = {
        worker,
        source,
        payload: {
          type: 'object',
          data
        }
      }
      if (!type) type = path.extname(file)
      if (type[0] === '.') type = type.slice(1)
      const body = { file, description, jobQueue, type }
      const rec = await createRecord({ model: 'SumbaDownload', body, req, options: { noFlash: true } })
      jobQueue.payload.data.download = { id: rec.data.id, file }
      await push(jobQueue)
    }

    getApiKeyFromUserId = async id => {
      const { hash } = this.app.bajoExtra
      const options = { forceNoHidden: true, noHook: true, noCache: true, attachment: true, mimeType: true }
      const resp = await this.app.dobo.getModel('SumbaUser').getRecord(id, options)
      return await hash(resp.salt)
    }
  }

  return Sumba
}

export default factory
