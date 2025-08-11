import path from 'path'

async function factory (pkgName) {
  const me = this

  return class Sumba extends this.lib.BajoPlugin {
    constructor () {
      super(pkgName, me.app)
      this.alias = 'sumba'
      this.dependencies = ['bajo-extra', 'bajo-common-db', 'bajo-config']
      this.config = {
        multiSite: false,
        license: false,
        waibu: {
          title: 'Sumba',
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
      this.downloadDir = `${getPluginDataDir(this.name)}/download`
      this.lib.fs.ensureDirSync(this.downloadDir)
      for (const type of ['secure', 'anonymous', 'team']) {
        this[`${type}Routes`] = this[`${type}Routes`] ?? []
        this[`${type}NegRoutes`] = this[`${type}NegRoutes`] ?? []
      }
    }

    _getSetting = async (type, source) => {
      const { defaultsDeep } = this.lib.aneka
      const { get } = this.lib._

      const setting = defaultsDeep(get(this.config, `auth.${source}.${type}`, {}), get(this.config, `auth.common.${type}`, {}))
      if (type === 'basic') setting.type = 'Basic'
      return setting
    }

    _getToken = async (type, req, source) => {
      const { isEmpty } = this.lib._

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
      const prefix = getPluginPrefix(this.name)
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
      }]
    }

    getUser = async (rec, safe = true) => {
      const { recordGet } = this.app.dobo
      const { omit, isPlainObject } = this.lib._
      let user
      if (isPlainObject(rec)) user = rec
      else user = await recordGet('SumbaUser', rec, { noHook: true })
      return safe ? omit(user, this.unsafeUserFields) : user
    }

    mergeTeam = async (user, site) => {
      if (!user) return
      const { map, pick } = this.lib._
      const { recordFindAll } = this.app.dobo
      user.teams = []
      const query = { userId: user.id, siteId: site.id }
      const userTeam = await recordFindAll('SumbaTeamUser', { query })
      if (userTeam.length === 0) return
      delete query.userId
      query.id = { $in: map(userTeam, 'id'), status: 'ENABLED' }
      const team = await recordFindAll('SumbaTeam', { query })
      if (team.length > 0) user.teams.push(...map(team, t => pick(t, ['id', 'alias'])))
    }

    getUserFromUsernamePassword = async (username = '', password = '', req) => {
      const { importPkg } = this.app.bajo
      const { recordFind, validate } = this.app.dobo
      const model = 'SumbaUser'
      await validate({ username, password }, model, { ns: ['sumba', 'dobo'], fields: ['username', 'password'] })
      const bcrypt = await importPkg('bajoExtra:bcrypt')

      const query = { username, provider: 'local' }
      const rows = await recordFind(model, { query }, { req, forceNoHidden: true, noHook: true })
      if (rows.length === 0) throw this.error('validationError', { details: [{ field: 'username', error: 'Unknown username' }], statusCode: 401 })
      const rec = rows[0]
      if (rec.status !== 'ACTIVE') throw this.error('validationError', { details: ['User is inactive or temporarily disabled'], statusCode: 401 })
      const verified = await bcrypt.compare(password, rec.password)
      if (!verified) throw this.error('validationError', { details: [{ field: 'password', error: 'invalidPassword' }], statusCode: 401 })
      return rec
    }

    createJwtFromUserRecord = async (rec) => {
      const { importPkg } = this.app.bajo
      const { dayjs } = this.lib
      const { hash } = this.app.bajoExtra
      const { get, pick } = this.lib._

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
      const { merge } = this.lib._
      const { isMd5, hash } = this.app.bajoExtra
      const { getUser } = this
      const { recordFind } = this.app.dobo

      let token = await this._getToken('apiKey', req, source)
      if (!isMd5(token)) return false
      token = await hash(token)
      const query = { token }
      const rows = await recordFind('SumbaUser', { query }, { req, noHook: true })
      if (rows.length === 0) throw this.error('invalidKey', merge({ statusCode: 401 }, payload))
      if (rows[0].status !== 'ACTIVE') throw this.error('userInactive', merge({ details: [{ field: 'status', error: 'inactive' }], statusCode: 401 }, payload))
      req.user = await getUser(rows[0])
      return true
    }

    verifyBasic = async (req, reply, source, payload) => {
      const { getUserFromUsernamePassword } = this
      const { getUser } = this
      const { isEmpty, merge } = this.lib._

      const setHeader = async (setting, reply) => {
        const { isString } = this.lib._

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
      const { recordGet } = this.app.dobo
      const { getUser } = this
      const { isEmpty, merge } = this.lib._

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
        const rec = await recordGet('SumbaUser', id, { req, noHook: true })
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
      const { includes } = this.lib.aneka
      const { outmatch } = this.lib

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
      const { outmatch } = this.lib

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
      const { outmatch } = this.lib
      const matcher = outmatch(guards)
      let guarded
      for (const path of paths) {
        if (!guarded) guarded = matcher(path)
      }
      return guarded
    }

    getSite = async (hostname, useId) => {
      const { omit } = this.lib._
      const { recordFind } = this.app.dobo
      const omitted = ['status']

      const mergeSetting = async (site) => {
        const { defaultsDeep } = this.lib.aneka
        const { parseObject } = this.app.bajo
        const { trim, get, filter } = this.lib._
        const { recordFind, recordGet } = this.app.dobo
        const defSetting = {}
        const nsSetting = {}
        const query = {
          ns: { $in: this.app.bajo.pluginNames },
          siteId: site.id
        }
        const all = await recordFind('SumbaSiteSetting', { query, limit: -1 })
        for (const ns of this.app.bajo.pluginNames) {
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
        const country = await recordGet('CdbCountry', site.country, { noHook: true })
        site.countryName = (country ?? {}).name ?? site.country
      }

      let site = {}

      if (!this.config.multiSite) {
        const resp = await recordFind('SumbaSite', { query: { alias: 'default' } }, { noHook: true })
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
      const rows = await recordFind('SumbaSite', filter, { noHook: true })
      if (rows.length === 0) throw this.error('unknownSite')
      const row = omit(rows[0], omitted)
      if (row.status !== 'ACTIVE') throw this.error('siteInactiveInfo')
      site = row
      await mergeSetting(site)
      return site
    }

    signin = async ({ user, req, reply }) => {
      const { getSessionId } = this.app.waibuMpa
      const { runHook } = this.app.bajo
      const { isEmpty, omit } = this.lib._
      let { referer } = req.body || {}
      if (req.session.ref) referer = req.session.ref
      req.session.ref = null
      const _user = omit(user, ['password', 'token'])
      req.session.userId = _user.id
      const sid = await getSessionId(req.headers.cookie)
      await runHook(`${this.name}:afterSignin`, _user, sid, req)
      const { query, params } = req
      const url = !isEmpty(referer) ? referer : this.config.redirect.afterSignin
      req.flash('notify', req.t('signinSuccessfully'))
      return reply.redirectTo(url, { query, params })
    }

    generatePassword = (req) => {
      const { generateId } = this.app.bajo
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
      const { recordCreate } = getPlugin('waibuDb')
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
      const rec = await recordCreate({ model: 'SumbaDownload', body, req, options: { noFlash: true } })
      jobQueue.payload.data.download = { id: rec.data.id, file }
      await push(jobQueue)
    }
  }
}

export default factory
