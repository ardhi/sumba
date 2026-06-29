import path from 'path'
import { joiPasswordExtendCore } from 'joi-password'

const defMultiSite = {
  enabled: false,
  catchAll: 'default'
}

/**
 * Plugin factory.
 *
 * **Never** call this function directly!!! It's only-meant to be called by the {@link https://ardhi.github.io/bajo|Bajo framework} during plugin initialization.
 *
 * @param {string} pkgName - NPM package name
 * @returns {Sumba} Sumba class
 */
async function factory (pkgName) {
  const me = this
  const { getModel } = this.app.dobo
  const { cloneDeep, isEmpty } = this.app.lib._

  /**
   * Sumba class definition.
   *
   * @class
   */
  class Sumba extends this.app.baseClass.Base {
    /**
     * Constructor
     */
    constructor () {
      super(pkgName, me.app)
      /**
       * @type {TConfig}
       */
      this.config = {
        multiSite: cloneDeep(defMultiSite),
        xSiteAdmins: [], // format: "<siteAlias>:<username>"
        waibu: {
          title: 'site',
          prefix: 'site'
        },
        dobo: {
          model: {}
        },
        waibuMpa: {
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
          redirectSubRoute: {
            waibuAdmin: {
              '/': 'waibuAdmin:/site/site',
              '/x': 'waibuAdmin:/site/x/site/list',
              '/x/*': 'waibuAdmin:/site/x/{2}/list',
              '/*': 'waibuAdmin:/site/{1}/list'
            }
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
              headerKey: 'X-Auth-ApiKey',
              algo: 'sha256' // changing this require each and every user to reset their apiKey
            },
            basic: {
            },
            jwt: {
              type: 'Bearer',
              qsKey: 'token',
              headerKey: 'X-Auth-Jwt',
              secret: '668de9cf57316c7dbf52f7ff7611c299',
              expiresInDur: '7d'
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
              realm: true,
              warningMessage: 'pleaseAuthenticate'
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
          timeZone: 'UTC',
          userPassword: {
            minUpperCase: 1,
            minLowerCase: 1,
            minSpecialChar: 1,
            minNumeric: 1,
            noWhitespace: false,
            latinOnlyChars: false,
            pattern: {
              lowerCase: 'abcdefghijklmnopqrstuvwxyz',
              upperCase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
              specialChar: '!@#$%*',
              numeric: '0123456789'
            }
          }
        },
        cacheTtl: {
          getSiteDur: '1m',
          getUserByIdDur: '1m',
          getUserByTokenDur: '1m'
        }
      }
      this.secureGuards = []
      this.actionGuards = []
      this.queryGuards = []
      this.attribGuards = []
      this.secureGuards = []
      this.anonymousGuards = []

      this.unsafeUserFields = ['password']
    }

    /**
     * Plugin initialization method. This method is called by the {@link https://ardhi.github.io/bajo|Bajo framework} during plugin initialization.
     *
     * @async
     * @method
     */
    init = async () => {
      this.downloadDir = `${this.app.getPluginDataDir(this.ns)}/download`
      this.app.lib.fs.ensureDirSync(this.downloadDir)
      if (this.config.multiSite === true) {
        this.config.multiSite = cloneDeep(defMultiSite)
        this.config.multiSite.enabled = true
      }
    }

    /**
     * Plugin start method. This method is called by the {@link https://ardhi.github.io/bajo|Bajo framework} during plugin start.
     *
     * @async
     * @method
     */
    start = async () => {
      await this.populateRouteGuards()
      if (!this.config.multiSite.enabled) {
        this.config.xSiteAdmins = []
        return
      }
      if (this.config.xSiteAdmins.length === 0) {
        const site = await getModel('SumbaSite').findOneRecord({ query: { alias: 'default' } }, { noMagic: true })
        const user = await getModel('SumbaUser').findOneRecord({ query: { username: 'admin', siteId: site.id + '' } }, { noMagic: true })
        this.config.xSiteAdmins.push(`${site.alias}:${user.username}`)
      }
    }

    /**
     * Populate route guards at start
     *
     * @async
     * @method
     * @param {array} [sites] - List of sites to populate route guards for. If not provided, it will fetch all active sites.
     */
    populateRouteGuards = async (sites) => {
      const { isString, get, difference } = this.app.lib._
      const { pascalCase } = this.app.lib.aneka
      const { eachPlugins, readConfig, breakNsPath } = this.app.bajo
      const { getModel } = this.app.dobo

      const allNs = this.app.getAllNs()
      if (!sites) sites = await getModel('SumbaSite').findAllRecord({ query: { status: 'ACTIVE' } }, { noMagic: true, dataOnly: true, fields: ['id', 'hostname'] })

      const sanitize = (item, ns) => {
        if (isString(item)) item = { path: item }
        let [prefix, ...args] = item.path.split(':')
        const neg = prefix[0] === '!'
        if (neg) prefix = prefix.slice(1)
        if (isEmpty(args)) {
          args = prefix
          prefix = null
        } else args = args.join(':')
        if (isEmpty(prefix)) prefix = ns
        else {
          const [_ns, subNs] = prefix.split('.')
          if (subNs) prefix = `${ns}.${subNs}`
          else if (!allNs.includes(_ns)) prefix = `${ns}.${_ns}`
          else prefix = _ns
        }
        item.path = `${neg ? '!' : ''}${prefix}:${args}`
        item._immutable = item._immutable ?? ['path']
        if (neg) {
          item.allTeams = true
          item.teamIds = []
          item._immutable = ['path', 'teamIds', 'allTeams']
        }
        return item
      }

      const filterFn = item => {
        let [ns] = (item.path.split(':')[0] ?? '').split('.')
        if (ns[0] === '!') ns = ns.slice(1)
        return allNs.includes(ns)
      }

      for (const type of ['secure', 'anonymous']) {
        const routes = []
        // get it from <pluginDir>/extend/sumba/route/*
        await eachPlugins(async function ({ file }) {
          const { ns } = this
          const items = (await readConfig(file)).map(item => sanitize(item, ns)).filter(filterFn)
          routes.push(...items)
        }, { glob: `route/${type}.*`, prefix: this.ns })
        // get it from config
        const items = get(this, `config.route.${type}`, []).map(item => {
          if (isString(item)) item = { path: item }
          const neg = item.path[0] === '!'
          if (neg) item.path.slice(1)
          const { fullNs } = breakNsPath(item.path)
          if (neg) item.path = '!' + item.path
          return sanitize(item, fullNs)
        }).filter(filterFn)
        routes.push(...items)
        const paths = routes.map(item => item.path)
        const model = getModel(pascalCase(`Sumba ${type} Guard`))
        for (const site of sites) {
          const query = { path: { $in: paths }, siteId: site.id + '' }
          const recs = await model.findAllRecord({ query }, { noMagic: true, dataOnly: true, fields: ['path', 'status'] })
          const spaths = difference(paths, recs.map(rec => rec.path))
          for (const path of spaths) {
            const body = cloneDeep(routes.find(r => r.path === path))
            body.status = 'ACTIVE'
            body.siteId = site.id + ''
            await model.sanitizeFixture({ body, lookupValue: body })
            try {
              await model.createRecord(body, { noMagic: true, noReturn: true })
            } catch (err) {}
          }
        }
      }
    }

    /**
     * Get authentication setting based on type and source
     *
     * @async
     * @method
     * @private
     * @param {string} type - The type of authentication setting to retrieve.
     * @param {string} source - The source of the authentication setting.
     * @returns {object} - The authentication setting object.
     */
    _getAuthSetting = async (type, source) => {
      const { defaultsDeep } = this.app.lib.aneka
      const { get } = this.app.lib._

      const setting = defaultsDeep(get(this.config, `auth.${source}.${type}`, {}), get(this.config, `auth.common.${type}`, {}))
      if (type === 'basic') setting.type = 'Basic'
      return setting
    }

    /**
     * Get authentication token based on type, request, and source
     *
     * @async
     * @method
     * @private
     * @param {string} type - The type of authentication setting.
     * @param {object} req - The request object.
     * @param {string} source - The source of the authentication setting.
     * @returns {string|boolean} - The token if found, otherwise false.
     */
    _getAuthToken = async (type, req, source) => {
      const { isEmpty } = this.app.lib._

      const setting = await this._getAuthSetting(type, source)
      let token = req.headers[setting.headerKey.toLowerCase()]
      if (!['basic'].includes(type) && isEmpty(token)) token = req.query[setting.qsKey]
      if (isEmpty(token)) {
        const parts = (req.headers.authorization || '').split(' ')
        if (parts[0] === setting.type) token = parts[1]
      }
      if (isEmpty(token)) return false
      return token
    }

    /**
     * Build admin menu based on locals and request
     *
     * @async
     * @method
     * @param {object} locals - The locals object.
     * @param {object} req - The request object.
     * @returns {array} - The admin menu items.
     */
    adminMenu = async (locals, req) => {
      if (!this.app.waibuAdmin) return
      const { getPluginPrefix } = this.app.waibu
      const { findIndex } = this.app.lib._
      const prefix = getPluginPrefix(this.ns)
      const params = { action: 'list' }
      const items = [{
        title: 'manageSite',
        children: [
          { title: 'siteProfile', href: `waibuAdmin:/${prefix}/site` },
          { title: 'manageSiteSetting', href: `waibuAdmin:/${prefix}/site-setting/:action`, params }
        ]
      }, {
        title: 'manageUserTeam',
        children: [
          { title: 'manageUser', href: `waibuAdmin:/${prefix}/user/:action`, params },
          { title: 'manageUserSetting', href: `waibuAdmin:/${prefix}/user-setting/:action`, params },
          { title: 'manageTeam', href: `waibuAdmin:/${prefix}/team/:action`, params },
          { title: 'manageTeamUser', href: `waibuAdmin:/${prefix}/team-user/:action`, params },
          { title: 'manageTeamSetting', href: `waibuAdmin:/${prefix}/team-setting/:action`, params },
          { title: 'resetUserPassword', href: `waibuAdmin:/${prefix}/reset-user-password` }
        ]
      }, {
        title: 'permissionGuard',
        children: [
          { title: 'secureGuard', href: `waibuAdmin:/${prefix}/secure-guard/:action`, params },
          { title: 'anonymousGuard', href: `waibuAdmin:/${prefix}/anonymous-guard/:action`, params },
          { title: 'actionGuard', href: `waibuAdmin:/${prefix}/action-guard/:action`, params },
          { title: 'queryGuard', href: `waibuAdmin:/${prefix}/query-guard/:action`, params },
          { title: 'attribGuard', href: `waibuAdmin:/${prefix}/attrib-guard/:action`, params }
        ]
      }, {
        title: 'supportSystem',
        children: [
          { title: 'contactForm', href: `waibuAdmin:/${prefix}/contact-form/:action`, params },
          { title: 'contactFormCat', href: `waibuAdmin:/${prefix}/contact-form-cat/:action`, params },
          { title: 'ticket', href: `waibuAdmin:/${prefix}/ticket/:action`, params },
          { title: 'ticketCat', href: `waibuAdmin:/${prefix}/ticket-cat/:action`, params }
        ]
      }, {
        title: 'misc',
        children: [
          { title: 'manageDownload', href: `waibuAdmin:/${prefix}/download/:action`, params }
        ]
      }]
      const sessionMenu = { title: 'userSession', href: `waibuAdmin:/${prefix}/x/session/:action`, params }
      const cacheMenu = { title: 'cacheStorage', href: `waibuAdmin:/${prefix}/x/cache/:action`, params }
      if (this.config.multiSite.enabled) {
        items.unshift({
          title: 'xSite',
          children: [
            { title: 'allSites', href: `waibuAdmin:/${prefix}/x/site/:action`, params },
            { title: 'siteSetting', href: `waibuAdmin:/${prefix}/x/site-setting/:action`, params },
            sessionMenu
          ]
        })
      } else {
        const idx = findIndex(items, i => i.title === 'misc')
        if (idx > -1) items[idx].children.push(sessionMenu)
      }
      if (this.app.bajoCache) {
        const idx = findIndex(items, i => i.title === this.config.multiSite.enabled ? 'xSite' : 'misc')
        if (idx > -1)items[idx].children.push(cacheMenu)
      }
      return items
    }

    /**
     * Create JWT from user record
     *
     * @async
     * @method
     * @param {object} rec - The user record object.
     * @returns {object} - The JWT token and its expiration date.
     */
    createJwtFromUserRecord = async (rec) => {
      const { importPkg } = this.app.bajo
      const { dayjs } = this.app.lib
      const { get, pick } = this.app.lib._

      const fastJwt = await importPkg('bajoExtra:fast-jwt')
      const { createSigner } = fastJwt

      const opts = pick(this.config.auth.common.jwt, ['expiresInDur'])
      opts.key = get(this.config, 'auth.common.jwt.secret')
      const sign = createSigner(opts)
      const apiKey = await this.hash(rec.token)
      const payload = { uid: rec.id, apiKey }
      const token = await sign(payload)
      const expiresAt = dayjs().add(opts.expiresInDur).toDate()
      return { token, expiresAt }
    }

    /**
     * Verify user session
     *
     * @async
     * @method
     * @param {object} req - The request object.
     * @param {object} reply - The reply object.
     * @param {string} source - The source of the authentication setting.
     * @param {object} payload - The payload object.
     * @returns {boolean} - True if the session is valid, otherwise false.
     */
    verifySession = async (req, reply, source, payload) => {
      const { routePath } = this.app.waibu
      const { query, params } = req

      if (!req.session) return false
      if (req.session.userId) {
        req.user = await this.getUserById(req.session.userId, req)
        return true
      }
      const redir = routePath(this.config.redirect.signin, { query, params })
      req.session.ref = req.url
      throw this.error('_redirect', { path: redir })
    }

    /**
     * Verify API key
     *
     * @async
     * @method
     * @param {object} req - The request object.
     * @param {object} reply - The reply object.
     * @param {string} source - The source of the authentication setting.
     * @param {object} payload - The payload object.
     * @returns {boolean} - True if the API key is valid, otherwise false.
     */
    verifyApiKey = async (req, reply, source, payload) => {
      const { merge, camelCase } = this.app.lib._
      const checker = this.app.bajoExtra[camelCase(`is ${this.config.auth.common.apiKey.algo}`)]

      let token = await this._getAuthToken('apiKey', req, source)
      if (!checker(token)) return false
      token = await this.hash(token)
      const user = await this.getUserByToken(token, req)
      if (!user) throw this.error('invalidKey', merge({ statusCode: 401 }, payload))
      if (user.status !== 'ACTIVE') throw this.error('userInactive', merge({ details: [{ field: 'status', error: 'inactive' }], statusCode: 401 }, payload))
      req.user = user
      return true
    }

    /**
     * Verify basic authentication
     *
     * @async
     * @method
     * @param {object} req - The request object.
     * @param {object} reply - The reply object.
     * @param {string} source - The source of the authentication setting.
     * @param {object} payload - The payload object.
     * @returns {boolean|string} - True if the basic authentication is valid, otherwise false or an error message.
     */
    verifyBasic = async (req, reply, source, payload) => {
      const { isEmpty, merge } = this.app.lib._

      const setHeader = async (setting, reply) => {
        let header = setting.type
        const exts = []
        if (setting.realm) exts.push(`realm="${req.t('protectedArea')}"`)
        if (setting.useUtf8) exts.push('charset="UTF-8"')
        if (exts.length > 0) header += ` ${exts.join(', ')}`
        reply.header('WWW-Authenticate', header)
        reply.code(401)
      }

      const setting = await this._getAuthSetting('basic', source)
      let authInfo
      const parts = (req.headers.authorization ?? '').split(' ')
      if (parts[0] === setting.type) authInfo = parts[1]
      if (isEmpty(authInfo)) {
        if (setting.realm) {
          await setHeader(setting, reply)
          throw this.error(req.t('pleaseAuthenticate'), { statusCode: 403 })
        } else return false
      }
      const decoded = Buffer.from(authInfo, 'base64').toString()
      const [username, password] = decoded.split(':')
      try {
        req.user = await this.getUserByUsernamePassword(username, password, req)
      } catch (err) {
        if (err.statusCode === 401 && setting.realm) {
          await setHeader(setting, reply)
          return err.message
        }
        throw merge(err, payload)
      }
      return true
    }

    /**
     * Verify JWT authentication
     *
     * @async
     * @method
     * @param {object} req - The request object.
     * @param {object} reply - The reply object.
     * @param {string} source - The source of the authentication setting.
     * @param {object} payload - The payload object.
     * @returns {boolean} - True if the JWT authentication is valid, otherwise false.
     */
    verifyJwt = async (req, reply, source, payload) => {
      const { importPkg } = this.app.bajo
      const { isEmpty, merge } = this.app.lib._

      const fastJwt = await importPkg('bajoExtra:fast-jwt')
      const { createVerifier } = fastJwt
      const setting = await this._getAuthSetting('jwt', source)
      const token = await this._getAuthToken('jwt', req, source)
      if (isEmpty(token)) return false
      const verifier = createVerifier({
        key: setting.secret,
        complete: true
      })
      const decoded = await verifier(token)
      const id = decoded.payload.uid
      try {
        const user = await this.getUserById(id, req)
        if (!user) throw this.error('invalidToken', { statusCode: 401 })
        if (user.status !== 'ACTIVE') throw this.error('userInactive', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
        req.user = user
      } catch (err) {
        merge(err, payload)
        throw err
      }
      return true
    }

    /**
     * Check route guard
     *
     * @method
     * @param {Array} guards - The array of guard objects.
     * @param {Array} paths - The array of paths to check.
     * @returns {string|undefined} - The matched path or undefined if no match is found.
     */
    checkRouteGuard = (guards, paths) => {
      const { outmatch } = this.app.lib
      const all = guards.map(item => item.path)
      const isMatch = outmatch(all)
      return paths.find(isMatch)
    }

    /**
     * Sign out user and redirect to the specified URL
     *
     * @async
     * @method
     * @param {object} options - The options object.
     * @param {object} options.req - The request object.
     * @param {object} options.reply - The reply object.
     * @param {string} [options.reason] - The reason for signing out.
     */
    signout = async (options = {}) => {
      const { req, reply, reason } = options
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

    /**
     * Sign in user and redirect to the specified URL
     *
     * @async
     * @method
     * @param {object} options - The options object.
     * @param {object} options.req - The request object.
     * @param {object} options.reply - The reply object.
     * @param {object} options.user - The user object.
     */
    signin = async (options = {}) => {
      const { req, reply, user } = options
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

    /**
     * Generate a random password based on the configuration settings
     *
     * @method
     * @param {object} req - The request object.
     * @returns {string} - The generated password.
     */
    generatePassword = (req = {}) => {
      const { get } = this.app.lib._
      const { generateId } = this.app.lib.aneka
      const cfg = get(req, 'site.setting.sumba.userPassword', this.config.siteSetting.userPassword)
      let passwd = generateId()
      if (cfg.minLowerCase > 0) passwd += generateId({ pattern: cfg.pattern.lowerCase, length: cfg.minLowercase })
      if (cfg.minUpperCase > 0) passwd += generateId({ pattern: cfg.pattern.upperCase, length: cfg.minUppercase })
      if (cfg.minSpecialChar > 0) passwd += generateId({ pattern: cfg.pattern.specialChar, length: cfg.minSpecialChar })
      if (cfg.minNumeric > 0) passwd += generateId({ pattern: cfg.pattern.numeric, length: cfg.minNumeric })
      return passwd
    }

    pushDownload = async ({ description, worker, data, source, req, file, type }) => {
      const { createRecord } = this.app.getPlugin('waibuDb')
      const { push } = this.app.getPlugin('bajoQueue')
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

    /**
     * Get API key from user ID by hashing the user's salt
     *
     * @async
     * @method
     * @param {string|number} id - The user ID.
     * @returns {Promise<string>} - A promise that resolves to the API key.
     */
    getApiKeyFromUserId = async id => {
      const options = { forceNoHidden: true, noHook: true, noCache: true, attachment: true, mimeType: true }
      const resp = await getModel('SumbaUser').getRecord(id, options)
      return await this.hash(resp.salt)
    }

    /**
     * Get a list of countries with their values and names
     *
     * @async
     * @method
     * @returns {Promise<Array<{ value: string|number, text: string }>>} - A promise that resolves to an array of country values and names.
     */
    getCountriesValues = async () => {
      const { getModel } = this.app.dobo
      const model = getModel('CdbCountry')
      const items = await model.findAllRecord({}, { noMagic: true, dataOnly: true })
      return items.map(item => ({ value: item.id, text: item.name }))
    }

    /**
     * Method to send mail through Masohi Messaging System. It is a thin wrapper
     * for {@link https://github.com/ardhi/masohi-mail|masohi-mail} send method.
     *
     * If both masohiMail and waibu are not loaded, nothing is delivered.
     *
     * @method
     * @async
     * @param {(string|Array)} tpl - Mail's template to use. If a string is given, the same template will be used for html & plaintext versions. Otherwise, the first template will be used for html mail, and the second one is for it's plaintext version
     * @param {Object} [params={}] - {@link https://github.com/ardhi/masohi-mail|masohi-mail}'s params object.
     */
    sendMail = async (tpl, { payload = {}, conn, source, options = {} } = {}) => {
      if (!this.app.masohiMail || !this.app.waibu) return
      conn = conn ?? 'masohiMail:default'
      const { importModule } = this.app.bajo
      const { get, isString } = this.app.lib._
      const { generateId } = this.app.lib.aneka
      const { render } = this.app.bajoTemplate
      const buildLocals = await importModule('waibu:/lib/build-locals.js')

      if (isString(tpl)) tpl = [tpl]
      options.partial = false
      const locals = await buildLocals.call(this, { params: payload.data, opts: options })
      payload.from = payload.from ?? get(options, 'req.site.email', payload.from)
      const opts = {
        lang: get(options, 'req.lang'),
        groupId: get(options, 'req.id', generateId())
      }
      payload.html = await render(tpl[0], locals, opts)
      if (tpl[1]) payload.text = await render(tpl[1], locals, opts)
      await this.app.masohiMail.send({ payload, source: source ?? this.ns, conn })
    }

    /**
     * Reset token by generating a new salt and hashing it twice to create a new token.
     *
     * @async
     * @method
     * @param {string} [text] - Optional text to use as the salt. If not provided, a new salt will be generated.
     * @returns {Promise<{ salt: string, token: string }>} - A promise that resolves to an object containing the salt and token.
     */
    resetToken = async (text) => {
      const { generateId } = this.app.lib.aneka
      const salt = text ?? generateId()
      const token = await this.hash(await this.hash(salt))
      return { salt, token }
    }

    /**
     * Generate a password validation rule based on the configuration settings.
     *
     * @async
     * @method
     * @param {object} req - The request object.
     * @returns {object} - The Joi password validation rule.
     */
    passwordRule = async (req = {}) => {
      const { get } = this.app.lib._
      const { importPkg } = this.app.bajo
      const joi = await importPkg('dobo:joi')
      const joiPassword = joi.extend(joiPasswordExtendCore)
      let password = joiPassword
        .string()
        .min(8)
        .max(100)
        .required()
      const cfg = get(req, 'site.setting.sumba.userPassword', this.config.siteSetting.userPassword)
      if (cfg.minUppeCase) password = password.minOfUppercase(cfg.minUpperCase)
      if (cfg.minLowercase) password = password.minOfLowercase(cfg.minLowerCase)
      if (cfg.minSpecialChar) password = password.minOfSpecialCharacters(cfg.minSpecialChar)
      if (cfg.minNumeric) password = password.minOfNumeric(cfg.minNumeric)
      if (cfg.noWhitespace) password = password.noWhiteSpaces()
      if (cfg.latinOnlyChars) password = password.onlyLatinCharacters()
      return password
    }

    /**
     * Hash the given item using the specified algorithm from the configuration.
     *
     * @async
     * @method
     * @param {*} item - The item to be hashed.
     * @returns {Promise<string>} - A promise that resolves to the hashed value.
     */
    hash = async (item) => {
      const { hash } = this.app.bajoExtra
      return await hash(item, this.config.auth.common.apiKey.algo)
    }

    /**
     * Fetch guards of the specified type from the database.
     *
     * @async
     * @method
     * @private
     * @param {string} type - The type of guards to fetch. Available types are 'Action', 'Attrib', 'Query', 'Secure', and 'Anonymous'.
     * @returns {Promise<Array>} - A promise that resolves to an array of guards.
     */
    _fetchGuards = async (type) => {
      const { getModel } = this.app.dobo
      const options = { noMagic: true, noCache: true, noDriverHook: true, dataOnly: true }
      const filter = { query: { status: 'ACTIVE' } }
      const results = await getModel(`Sumba${type}Guard`).findAllRecord(filter, options)
      return results.map(result => {
        result.teamIds = result.teamIds.map(item => item + '')
        return result
      })
    }

    /**
     * Process and order the guards based on their path and weight.
     *
     * @method
     * @private
     * @param {Array} inputs - The array of guard inputs.
     * @returns {Array} - The processed and ordered array of guards.
     */
    _getGuards = (inputs = []) => {
      const { routePath } = this.app.waibu
      const { orderBy } = this.app.lib._
      const normal = orderBy(inputs.filter(input => {
        try {
          input.path = routePath(input.path)
        } catch (err) {
          return false
        }
        return input.path[0] !== '!'
      }), ['weight', 'path'], ['desc', 'asc'])
      const inverse = orderBy(inputs.filter(input => {
        try {
          input.path = routePath(input.path)
        } catch (err) {
          return false
        }
        return input.path[0] === '!'
      }), ['weight', 'path'], ['desc', 'asc'])
      return [...normal, ...inverse]
    }

    /**
     * Get anonymous guards, optionally reloading them from the database.
     *
     * @async
     * @method
     * @param {boolean} [reread] - Whether to reload the guards from the database.
     * @returns {Promise<Array>} - A promise that resolves to an array of anonymous guards.
     */
    getAnonymousGuards = async (reread) => {
      if (!reread) return this.anonymousGuards
      const guards = await this._fetchGuards('Anonymous')
      this.anonymousGuards = this._getGuards(guards)
      return this.anonymousGuards
    }

    /**
     * Get secure guards, optionally reloading them from the database.
     *
     * @async
     * @method
     * @param {boolean} [reread] - Whether to reload the guards from the database.
     * @returns {Promise<Array>} - A promise that resolves to an array of secure guards.
     */
    getSecureGuards = async (reread) => {
      if (!reread) return this.secureGuards
      const guards = await this._fetchGuards('Secure')
      this.secureGuards = this._getGuards(guards)
      return this.secureGuards
    }

    /**
     * Get query guards, optionally reloading them from the database.
     *
     * @async
     * @method
     * @param {boolean} [reread] - Whether to reload the guards from the database.
     * @returns {Promise<Array>} - A promise that resolves to an array of query guards.
     */
    getQueryGuards = async (reread) => {
      if (!reread) return this.queryGuards

      this.queryGuards = await this._fetchGuards('Query')
      return this.queryGuards
    }

    /**
     * Get action guards, optionally reloading them from the database.
     *
     * @async
     * @method
     * @param {boolean} [reread] - Whether to reload the guards from the database.
     * @returns {Promise<Array>} - A promise that resolves to an array of action guards.
     */
    getActionGuards = async (reread) => {
      if (!reread) return this.actionGuards

      this.actionGuards = await this._fetchGuards('Action')
      return this.actionGuards
    }

    /**
     * Get attribute guards, optionally reloading them from the database.
     *
     * @async
     * @method
     * @param {boolean} [reread] - Whether to reload the guards from the database.
     * @returns {Promise<Array>} - A promise that resolves to an array of attribute guards.
     */
    getAttribGuards = async (reread) => {
      if (!reread) return this.attribGuards

      this.attribGuards = await this._fetchGuards('Attrib')
      return this.attribGuards
    }

    /**
     * Get all loaded model names, optionally returning them as value-text pairs.
     *
     * @method
     * @param {boolean} [asValue] - Whether to return the model names as value-text pairs.
     * @returns {Array} - An array of model names or value-text pairs.
     */
    getModelNames = (asValue) => {
      const values = this.app.dobo.models.map(item => item.name).sort()
      return asValue ? values.map(item => ({ value: item, text: item })) : values
    }

    /**
     * Gather all paths to check for a request.
     *
     * @method
     * @param {Object} req - The request object.
     * @returns {Array} - An array of paths to check.
     */
    pathsToCheck = (req) => {
      const { isSet } = this.app.lib.aneka
      const { uniq, without } = this.app.lib._
      const items = [req.routeOptions.url, req.url].filter(url => isSet(url)).map(url => url.split('?')[0].split('#')[0])
      return uniq(without(items, undefined, null))
    }

    /**
     * Check and set the iconset for a request.
     *
     * @async
     * @method
     * @param {Object} req - The request object.
     * @param {Object} reply - The reply object.
     * @returns {Promise<void>} - A promise that resolves when the iconset is checked and set.
     */
    checkIconset = async (req, reply) => {
      const { get, isString } = this.app.lib._
      const mpa = this.app.waibuMpa

      if (!req.site) return
      const siteIconset = get(req, 'site.setting.waibuMpa.iconset')
      req.iconset = siteIconset ?? get(mpa, 'config.iconset.set', 'default')
      const hiconset = req.headers['x-iconset']
      if (isString(hiconset) && mpa.getIconset(hiconset)) req.iconset = hiconset
      req.iconset = req.iconset ?? 'default'
    }

    /**
     * Check and set the theme for a request.
     *
     * @async
     * @method
     * @param {Object} req - The request object.
     * @param {Object} reply - The reply object.
     * @returns {Promise<void>} - A promise that resolves when the theme is checked and set.
     */
    checkTheme = async (req, reply) => {
      const { get, isString } = this.app.lib._
      const mpa = this.app.waibuMpa

      if (!req.site) return
      const siteTheme = get(req, 'site.setting.waibuMpa.theme')
      req.theme = siteTheme ?? get(mpa, 'config.theme.set', 'default')
      const htheme = req.headers['x-theme']
      if (isString(htheme) && mpa.getTheme(htheme)) req.theme = htheme
      req.theme = req.theme ?? 'default'
    }

    /**
     * Check and set the team for a request.
     *
     * @async
     * @method
     * @param {Object} req - The request object.
     * @param {Object} reply - The reply object.
     * @returns {Promise<void>} - A promise that resolves when the team is checked and set.
     */
    checkTeam = async (req, reply) => {
      const { includes } = this.app.lib.aneka
      const { outmatch } = this.app.lib

      if (req.user.isAdmin) return
      if (req.routeOptions.config.xSite && req.user.isXSiteAdmin) return

      const teamIds = req.user.teams.map(item => item.id + '')
      // if (req.user.teams.map(item => item.alias).length === 0) throw this.error('accessDenied', { statusCode: 403 })

      const paths = this.pathsToCheck(req)
      const results = (await this.getSecureGuards()).filter(item => {
        if (item.siteId !== req.site.id + '' || item.path[0] === '!') return false
        return paths.some(outmatch([item.path]))
      })
      for (const result of results) {
        if (result.allTeams) continue
        if (!includes(teamIds, result.teamIds)) throw this.error('accessDenied', { statusCode: 403 })
      }
      // passed
    }

    /**
     * Check and set the user for a request.
     *
     * @async
     * @method
     * @param {Object} req - The request object.
     * @param {Object} reply - The reply object.
     * @param {Object} source - The source object.
     * @returns {Promise<boolean|void>} - A promise that resolves to a boolean indicating the result of the check or void.
     */
    checkUser = async (req, reply, source) => {
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

      const paths = this.pathsToCheck(req)
      let guards = (await this.getAnonymousGuards()).filter(item => item.siteId === req.site.id + '')
      const anonymous = this.checkRouteGuard(guards, paths)
      if (anonymous) {
        if (!userId) return false
        req.session.ref = req.url
        return reply.redirectTo(routePath(this.config.redirect.signout))
      }
      guards = (await this.getSecureGuards()).filter(item => item.siteId === req.site.id + '')
      const secure = this.checkRouteGuard(guards, paths)
      if (!secure) {
        if (userId) await setUser()
        return false // regular, unguarded path. Not secure & not anonymous path
      }
      if (userId) {
        await setUser()
        return secure
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
      return secure
    }

    /**
     * Check and set the Cross-site settings for a request.
     *
     * @async
     * @method
     * @param {Object} req - The request object.
     * @param {Object} reply - The reply object.
     * @returns {Promise<void>} - A promise that resolves when the XSite is checked and set.
     */
    checkXSite = async (req, reply) => {
      const { get } = this.app.lib._
      if (!this.config.multiSite.enabled) return
      const config = get(req, 'routeOptions.config')
      if (!get(config, 'xSite') || ['/dashboard'].includes(config.pathSrc)) return
      if (!get(req, 'user.isXSiteAdmin')) throw this.error('accessDenied', { statusCode: 403 })
    }

    /**
     * Check the route for a request.
     *
     * @async
     * @method
     * @param {Object} req - The request object.
     * @returns {Promise<void>} - A promise that resolves when the route is checked.
     */
    checkRoute = async (req) => {
      const { routePath } = this.app.waibu
      const { outmatch } = this.app.lib
      const routes = req.getSetting('waibu:route.disabled', []).map(item => routePath(item, false))
      if (routes.length === 0) return
      const isMatch = outmatch(routes)
      const paths = this.pathsToCheck(req)
      if (paths.find(isMatch)) throw this.error('_notFound')
    }

    /**
     * Parse namespace settings for a request.
     *
     * @method
     * @param {string} ns - The namespace.
     * @param {Object} setting - The setting object.
     * @param {Array} items - The items to parse.
     */
    parseNsSettings = (ns, setting, items) => {
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
        else {
          const dt = dayjs(value)
          if (dt.isValid()) value = dt.toDate()
        }
        if ((isPlainObject(value) || isArray(value)) && isEmpty(value)) continue
        set(setting, `${ns}.${item.key}`, value)
      }
    }

    /**
     * Get all fixtures for the specified alias, replacing any occurrences of '{alias}' in the fixture data with the provided alias.
     *
     * @async
     * @method
     * @param {string} [alias] - The alias for the fixtures.
     * @returns {Promise<object>} - A promise that resolves to the fixtures data.
     */
    getAllFixtures = async (alias) => {
      const { readConfig } = this.app.bajo
      const { isEmpty, omit, kebabCase, isString } = this.app.lib._
      const { getModel } = this.app.dobo
      const { fastGlob } = this.app.lib
      const data = {}

      function replaceAlias (alias, items) {
        for (const item of items) {
          for (const key in item) {
            const val = item[key]
            if (isString(val)) item[key] = val.replaceAll('{alias}', alias)
          }
        }
      }

      const formats = this.app.configHandlers.map(item => item.ext.slice(1))
      const overrideBase = `${this.app.getPluginDataDir('sumba')}/create-new-site-fixtures/${alias}`
      const models = this.app.dobo.models.filter(m => {
        const prop = m.properties.find(p => p.name === 'siteId')
        return !!prop
      }).map(m => m.name)
      models.unshift('SumbaSite')
      const files = (await fastGlob(`${overrideBase}/*.{${formats.join(',')}}`)).map(file => {
        const ext = path.extname(file)
        return file.slice(0, file.length - ext.length)
      })
      for (const m of models) {
        const model = getModel(m)
        const file = `${overrideBase}/${kebabCase(m)}`
        let fixtures = (await model.loadFixtures({ collectItems: true, noLookup: true })) ?? []
        if (files.includes(file)) {
          const items = await readConfig(file, { defValue: [] })
          if (!isEmpty(items)) fixtures = items
        }
        if (!Array.isArray(fixtures)) fixtures = [fixtures]
        if (fixtures.length === 0) continue
        replaceAlias(alias, fixtures)
        if (isEmpty(alias)) throw this.error('aliasRequired%s', alias)
        const omitted = ['_attachments', 'siteId']
        for (const item of ['createdAt', 'updatedAt', 'immutable']) {
          const props = model.properties.filter(prop => prop.feature === ('dobo:' + item)).map(prop => prop.name)
          if (props.length > 0) omitted.push(...props)
        }
        for (const idx in fixtures) {
          fixtures[idx] = omit(fixtures[idx], omitted)
        }
        data[m] = m === 'SumbaSite' ? fixtures[0] : fixtures
      }
      return data
    }

    /**
     * Create references for the specified site using the provided data, options, and verbosity settings.
     *
     * @async
     * @method
     * @param {object} site - The site object for which to create references.
     * @param {object} data - The data object containing fixtures for the site.
     * @param {object} options - Options to pass to the createRecord method.
     * @param {boolean} verbose - Whether to log verbose output.
     */
    createRefs = async (site, data, options, verbose) => {
      const { isString } = this.app.lib._
      const { getModel } = this.app.dobo
      for (const m in data) {
        if (m === 'SumbaSite') continue
        const mdl = getModel(m)
        const fixtures = data[m]
        for (const f of fixtures) {
          f.siteId = site.id + ''
          const lv = { siteId: f.siteId }
          for (const key in f) {
            const val = f[key]
            if (isString(val) && val.slice(0, 2) === '?:') f[key] = await mdl._simpleLookup(val.slice(2), lv, options)
          }
          await mdl.createRecord(f, { ...options, noFlash: true })
        }
        if (verbose) this.print.succeed('writingModel%s%s', mdl.name, fixtures.length)
      }
      if (verbose) this.print.succeed('populateRouteGuard')
      await this.populateRouteGuards([site])
    }

    /**
     * Create a new site with the specified alias and optional hostname, using fixtures for initial data.
     *
     * @async
     * @method
     * @param {string} alias - The alias for the new site.
     * @param {string} [hostname] - The hostname for the new site.
     * @param {boolean} [verbose=false] - Whether to log verbose output.
     */
    createNewSite = async (alias, hostname, verbose) => {
      const { isEmpty } = this.app.lib._
      const { getModel } = this.app.dobo

      if (isEmpty(alias)) throw this.error('aliasRequired%s', alias)
      let spin
      if (verbose) spin = this.print.spinner().start('processing...')
      const query = { $or: [{ alias }] }
      if (!isEmpty(hostname)) query.$or.push({ hostname })
      const model = getModel('SumbaSite')
      const site = await model.findOneRecord({ query })
      if (!isEmpty(site)) {
        if (verbose) spin.stop()
        throw this.error('aliasOrHostnameExists%s%s', alias, hostname ?? '')
      }
      // lets go
      const fixtures = await this.getAllFixtures(alias)
      if (verbose) spin.stop()
      fixtures.SumbaSite.alias = alias
      if (!isEmpty(hostname)) fixtures.SumbaSite.hostname = hostname
      await model.transaction(async (trx) => {
        const newSite = await model.createRecord(fixtures.SumbaSite, { trx, noHook: true })
        if (verbose) this.print.succeed('writingModel%s%s', model.name, 1)
        const options = { trx }
        await this.createRefs(newSite, fixtures, options, verbose)
      })
      if (verbose) this.print.info('done')
    }

    /**
     * Remove references for the specified site using the provided options and verbosity settings.
     *
     * @async
     * @method
     * @param {object} site - The site object for which to remove references.
     * @param {object} options - Options to pass to the removeRecord method.
     * @param {boolean} verbose - Whether to log verbose output.
     */
    removeRefs = async (site, options, verbose) => {
      const { orderBy } = this.app.lib._
      const { getModel } = this.app.dobo
      const models = orderBy(this.app.dobo.models, ['buildLevel'], ['desc']).filter(m => {
        const prop = m.properties.find(p => p.name === 'siteId')
        return !!prop
      }).map(m => m.name)
      for (const m of models) {
        const mdl = getModel(m)
        const rows = await mdl.findAllRecord({ query: { siteId: site.id + '' } }, { ...options, dataOnly: true })
        const ids = rows.map(item => item.id)
        // TODO: backup
        if (ids.length === 0) continue
        for (const id of ids) {
          await mdl.removeRecord(id, { noReturn: true, ...options, noFlash: true })
        }
        if (verbose) this.print.succeed('removedFrom%s%s', mdl.name, ids.length)
      }
    }

    /**
     * Remove a site with the specified alias, along with its references, using the provided verbosity settings.
     *
     * @async
     * @method
     * @param {string} alias - The alias of the site to remove.
     * @param {boolean} [verbose=false] - Whether to log verbose output.
     */
    removeSite = async (alias, verbose) => {
      const { isEmpty } = this.app.lib._
      const { getModel } = this.app.dobo

      if (isEmpty(alias)) throw this.error('aliasRequired%s', alias)
      const model = getModel('SumbaSite')
      const query = { alias }
      const site = await model.findOneRecord({ query })
      if (isEmpty(site)) throw this.error('aliasNotFound%s', alias)
      await model.transaction(async (trx) => {
        const options = { trx, noHook: true }
        await this.removeRefs(site, options, verbose)
        await model.removeRecord(site.id, { noReturn: true, trx, noHook: true })
        if (verbose) this.print.succeed('removedFrom%s%s', model.name, 1)
      })
      if (verbose) this.print.info('done')
    }

    /**
     * Get site information based on the provided input, which can be either a hostname or an ID. If multi-site is enabled, it will fetch the site based on the hostname or ID; otherwise, it will return the default site.
     *
     * @async
     * @method
     * @param {string|number} input - The input value, which can be either a hostname or an ID.
     * @param {boolean} [byId=false] - Whether to fetch the site by ID.
     * @returns {object} The site information.
     */
    getSite = async (input, byId = false) => {
      const { omit } = this.app.lib._
      const { set: setCache, get: getCache } = this.app.bajoCache ?? {}
      const omitted = ['status']

      let site = {}
      const mergeSetting = async (site) => {
        const { defaultsDeep, isSet } = this.app.lib.aneka
        const { get, filter } = this.app.lib._
        const defSetting = {}
        const nsSetting = {}
        const names = this.app.getAllNs()
        const query = {
          ns: { $in: names },
          siteId: site.id + ''
        }
        const all = await this.app.dobo.getModel('SumbaSiteSetting').findAllRecord({ query })
        for (const ns of names) {
          const item = get(this, `app.${ns}.config.siteSetting`)
          if (isSet(item)) defSetting[ns] = item
          const items = filter(all, { ns })
          this.parseNsSettings(ns, nsSetting, items)
        }
        site.setting = defaultsDeep({}, nsSetting, defSetting)
        // additional fields
        const country = await this.app.dobo.getModel('CdbCountry').getRecord(site.country, { noMagic: true })
        site.countryName = (country ?? {}).name ?? site.country
      }

      if (!this.config.multiSite.enabled) {
        const filter = { query: { alias: 'default' } }
        const key = 'dobo|SumbaSite|getSite|default'
        if (getCache) {
          site = await getCache({ key })
          if (site) return site
        }
        const resp = await this.app.dobo.getModel('SumbaSite').findOneRecord(filter, { noHook: true })
        site = omit(resp, omitted)
        await mergeSetting(site)
        if (setCache) {
          await setCache({ key, value: site, ttl: this.config.cacheTtl.getSiteDur })
        }
        return site
      }
      let query
      if (byId) query = { id: input }
      else query = { hostname: input }
      const key = `dobo|SumbaSite|getSite|multiSite|${input}`
      if (getCache) {
        site = await getCache({ key })
        if (site) return JSON.parse(site)
      }
      let row = await this.app.dobo.getModel('SumbaSite').findOneRecord({ query }, { noHook: true })
      if (!row) {
        if (this.config.multiSite.catchAll) {
          query = { alias: this.config.multiSite.catchAll === true ? 'default' : this.config.multiSite.catchAll }
          row = await this.app.dobo.getModel('SumbaSite').findOneRecord({ query }, { noHook: true })
        }
        if (!row) throw this.error('unknownSite')
      }
      if (row.status !== 'ACTIVE') throw this.error('siteInactiveInfo')
      site = omit(row, omitted)
      await mergeSetting(site)
      if (setCache) {
        await setCache({ key, value: JSON.stringify(site), ttl: this.config.cacheTtl.getSiteDur })
      }
      return site
    }

    /**
     * Merge team information into the user object.
     *
     * @async
     * @method
     * @param {object} user - The user object to merge team information into.
     * @param {object} req - The request object.
     */
    mergeTeam = async (user, req) => {
      const { map, pick } = this.app.lib._
      const { getModel } = this.app.dobo
      user.teams = []
      const query = { userId: user.id + '', siteId: user.siteId, status: 'ACTIVE' }
      let mdl = getModel('SumbaTeamUser')
      const userTeam = await mdl.findAllRecord({ query })
      if (userTeam.length === 0) return
      delete query.userId
      const idProp = mdl.getProperty('id')
      const $in = userTeam.map(item => ['integer', 'smallint'].includes(idProp.type) ? parseInt(item.teamId) : item.teamId)
      query.id = { $in }
      mdl = getModel('SumbaTeam')
      const teams = await mdl.findAllRecord({ query })
      if (teams.length > 0) {
        delete query.id
        delete query.status
        query.teamId = { $in: teams.map(t => t.id + '') }
        mdl = getModel('SumbaTeamSetting')
        const items = await mdl.findAllRecord({ query })
        for (const team of teams) {
          const names = map(items, 'ns')
          const item = pick(team, ['id', 'alias'])
          item.setting = {}
          for (const ns of names) {
            this.parseNsSettings(ns, item.setting, items.filter(s => s.teamId === (team.id + '')))
          }
          user.teams.push(item)
        }
      }
      user.isXSiteAdmin = this.config.xSiteAdmins.includes(`${req.site.alias}:${user.username}`)
      user.isAdmin = user.teams.some(t => t.alias === 'administrator')
      for (const field of this.unsafeUserFields) {
        delete user[field]
      }
    }

    /**
     * Get a user by their ID.
     *
     * @async
     * @method
     * @param {string|number} id - The ID of the user to retrieve.
     * @param {object} req - The request object.
     * @returns {object|null} The user object if found, otherwise null.
     */
    getUserById = async (id, req) => {
      const { getModel } = this.app.dobo
      const { set: setCache, get: getCache } = this.app.bajoCache ?? {}
      const key = `dobo|SumbaUser|getUserById|${id}`
      let user
      if (getCache) {
        user = await getCache({ key })
        if (user) return JSON.parse(user)
      }
      user = await getModel('SumbaUser').getRecord(id, { noHook: true, noDriverHook: true, throwNotFound: false, req })
      if (!user) return
      await this.mergeTeam(user, req)
      if (setCache) {
        await setCache({ key, value: JSON.stringify(user), ttl: this.config.cacheTtl.getUserByIdDur })
      }
      return user
    }

    /**
     * Get a user by their token.
     *
     * @async
     * @method
     * @param {string} token - The token of the user to retrieve.
     * @param {object} req - The request object.
     * @returns {object|null} The user object if found, otherwise null.
     */
    getUserByToken = async (token, req) => {
      const { getModel } = this.app.dobo
      const { set: setCache, get: getCache } = this.app.bajoCache ?? {}
      const key = `dobo|SumbaUser|getUserByToken|${token}`
      let user
      if (getCache) {
        user = await getCache({ key })
        if (user) return JSON.parse(user)
      }
      user = await getModel('SumbaUser').findOneRecord({ query: { token } }, { noHook: true, noDriverHook: true, throwNotFound: false, req })
      if (!user) return
      await this.mergeTeam(user, req)
      if (setCache) {
        await setCache({ key, value: JSON.stringify(user), ttl: this.config.cacheTtl.getUserByTokenDur })
      }
      return user
    }

    getUserByUsernamePassword = async (username = '', password = '', req) => {
      const { getModel } = this.app.dobo
      const { importPkg } = this.app.bajo
      const model = getModel('SumbaUser')
      await model.validate({ username, password }, null, { partial: true, ns: ['sumba', 'dobo'], fields: ['username', 'password'] })
      const bcrypt = await importPkg('bajoExtra:bcrypt')

      const query = { username, provider: 'local', siteId: req.site.id + '' }
      const user = await model.findOneRecord({ query }, { req, forceNoHidden: true, noHook: true, noDriverHook: true })
      if (!user) throw this.error('validationError', { details: [{ field: 'username', error: 'Unknown username' }], statusCode: 401 })
      if (user.status !== 'ACTIVE') throw this.error('validationError', { details: ['User is inactive or temporarily disabled'], statusCode: 401 })
      const verified = await bcrypt.compare(password, user.password)
      if (!verified) throw this.error('validationError', { details: [{ field: 'password', error: 'invalidPassword' }], statusCode: 401 })
      await this.mergeTeam(user, req)
      return user
    }

    /**
     * Clear the cache for a specific site.
     *
     * @async
     * @method
     * @param {string|number} id - The ID of the site.
     * @param {object} result - The result object containing site data.
     */
    clearCacheSite = async (id, result) => {
      if (!this.app.bajoCache) return
      const { clear } = this.app.bajoCache ?? {}
      const { get } = this.app.lib._
      await clear({ key: 'dobo|SumbaSite|getSite|default' })
      await clear({ key: `dobo|SumbaSite|getSite|multiSite|${id}` })
      await clear({ key: `dobo|SumbaSite|getSite|multiSite|${get(result, 'data.hostname', get(result, 'oldData.hostname'))}` })
    }

    /**
     * Clear the cache for a specific user.
     *
     * @async
     * @method
     * @param {string|number} id - The ID of the user.
     * @param {object} result - The result object containing user data.
     */
    clearCacheUser = async (id, result) => {
      if (!this.app.bajoCache) return
      const { clear } = this.app.bajoCache ?? {}
      const { get } = this.app.lib._
      const token = get(result, 'data.token', get(result, 'oldData.token', ''))
      await clear({ key: `dobo|SumbaUser|getUserById|${id}` })
      await clear({ key: `dobo|SumbaUser|getUserByToken|${token}` })
    }

    /**
     * Filter model data based on settings.
     *
     * @method
     * @param {object} opts - The options object.
     * @param {object} opts.model - The model object.
     * @param {string} opts.field - The field to filter.
     * @param {object} [opts.options={}] - Additional options.
     * @returns {object} The filtered results and operation values.
     */
    filterModelFromSetting = (opts = {}) => {
      const { model, field, options = {} } = opts
      const { isEmpty, isArray, set } = this.app.lib._
      const { isSet } = this.app.lib.aneka
      const { req } = options
      const opValue = req.getSetting(`sumba:queryGuard.${field}`, {})
      const results = []
      const prop = model.getProperty(field)
      for (const op of ['in', 'nin', 'inOrEmpty']) {
        if (isEmpty(opValue[op]) || !isArray(opValue[op])) continue
        if (op === 'inOrEmpty') {
          const val = set({}, field, set({}, '$in', opValue[op]))
          const nl = set({}, field, { $eq: null })
          const item = { $or: [val, nl] }
          let v
          if (['string', 'text'].includes(prop.type)) v = ''
          else if (['integer', 'smallint', 'float', 'double'].includes(prop.type)) v = 0
          if (isSet(v)) {
            const bl = set({}, field, { $eq: v })
            item.$or.push(bl)
          }
          results.push(item)
        } else results.push(set({}, field, set({}, '$' + op, opValue[op])))
      }
      return { results, opValue }
    }

    /**
     * Apply query guards to the provided query.
     *
     * @async
     * @method
     * @param {object} [opts={}] - The options object.
     * @param {object} opts.model - The model object.
     * @param {object} [opts.q={}] - The query object.
     * @param {array} [opts.teamIds=[]] - The team IDs.
     * @param {object} [opts.options={}] - Additional options.
     */
    runQueryGuard = async (opts = {}) => {
      const { model, q = {}, teamIds = [], options = {} } = opts
      const { set, orderBy, isEmpty, isArray } = this.app.lib._
      const { includes } = this.app.lib.aneka
      const { sanitizeByType } = this.app.dobo
      const { req } = options
      const results = []

      const guards = await this.getQueryGuards()
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
        const inSetting = this.filterModelFromSetting({ model, field, options })
        if (inSetting.results.length > 0) inSetting.results.push(...inSetting.results)
        const prop = model.getProperty(field)
        const items = rules.filter(item => item.field === field)
        for (const item of items) {
          let values = item.value.map(val => {
            return sanitizeByType(val, prop.type, { strict: true, inputFormat: 'string', model: model.name })
          })
          const op = item.condition.toLowerCase()
          if (['in', 'nin'].includes(op) && !isEmpty(inSetting.opValue[op]) && isArray(inSetting.opValue[op])) values = values.filter(val => inSetting.opValue[op].includes(val))
          if (isEmpty(values)) continue
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

    /**
     * Apply attribute guards to the provided model.
     *
     * @async
     * @method
     * @param {object} [opts={}] - The options object.
     * @param {object} opts.model - The model object.
     * @param {array} [opts.teamIds=[]] - The team IDs.
     * @param {object} [opts.options={}] - Additional options.
     */
    runAttribGuard = async (opts = {}) => {
      const { model, teamIds = [], options = {} } = opts
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

    /**
     * Get the team IDs and aliases for the user in the request.
     *
     * @method
     * @param {object} req - The request object.
     * @returns {object} An object containing the team IDs and aliases.
     */
    getTeamIdsAndAliases = (req) => {
      const { get } = this.app.lib._
      const teams = get(req, 'user.teams', [])
      const teamIds = teams.map(team => team.id + '')
      const aliases = teams.map(team => team.alias)
      return { teamIds, aliases }
    }

    /**
     * Rebuild the filter for the provided model.
     *
     * @async
     * @method
     * @param {object} model - The model object.
     * @param {object} [filter={}] - The filter object.
     * @param {object} [options={}] - Additional options.
     * @returns {Promise<object>} The rebuilt filter.
     */
    rebuildFilter = async (model, filter = {}, options = {}) => {
      const { isEmpty, get, keys } = this.app.lib._
      const { req } = options
      const allowEmpty = !get(this, `app.${model.ns}.config.sumba.noEmptyQuery`, []).includes(model.name)
      const hasSiteId = model.hasProperty('siteId')
      const hasUserId = model.hasProperty('userId')
      const hasTeamId = model.hasProperty('teamId')
      const { teamIds, aliases } = this.getTeamIdsAndAliases(req)
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
        if (get(req, 'site.alias') === 'default') {
          filter.query = q
          return
        }
        const fields = keys(req.getSetting('sumba:queryGuard', {}))
        const results = []
        for (const field of fields) {
          if (!model.hasProperty(field)) continue
          const inSetting = this.filterModelFromSetting({ model, field, options })
          if (inSetting.results.length > 0) results.push(...inSetting.results)
        }
        if (results.length > 0) q.$and.push(...results)
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

      await this.runQueryGuard({ model, q, teamIds, options, allowEmpty })
      await this.runAttribGuard({ model, teamIds, options })
      if (q.$and.length === 0 && !allowEmpty) throw this.error('_emptyColumnQuery')
      filter.query = q
    }

    /**
     * Apply query hook to the provided model.
     *
     * @async
     * @method
     * @param {object} model - The model object.
     * @param {string|number} id - The ID of the model.
     * @param {object} options - Additional options.
     * @returns {object} The result of the model hook.
     */
    applyQueryHook = async (model, id, options = {}) => {
      const { isEmpty } = this.app.lib._
      const { req = {} } = options
      if (options.noAutoFilter || isEmpty(req) || isEmpty(req.site)) return

      const filter = {}
      await this.rebuildFilter(model, filter, options)
      if (filter.query.$and) filter.query.$and.push({ id })
      else filter.query.id = id
      const row = await model.findOneRecord(filter, { count: false })
      if (!row) throw this.app.dobo.error('recordNotFound%s%s', id, this.name, { statusCode: 404 })
    }

    /**
     * Apply action hook to the provided model.
     *
     * @async
     * @method
     * @param {object} [opts={}] - The options object.
     * @param {object} opts.model - The model object.
     * @param {array} [opts.teamIds=[]] - The team IDs.
     * @param {object} [opts.options={}] - Additional options.
     */
    applyActionHook = async (opts = {}) => {
      const { model, options = {} } = opts
      const { req } = options
      if (!req) return
      if (!req.site) return

      let action
      if (['findOneRecord', 'findRecord', 'countRecord', 'getRecord'].includes(options.action)) action = 'READ'
      else if (['createRecord', 'bulkCreateRecord'].includes(options.action)) action = 'CREATE'
      else if (['updateRecord', 'upsertRecord'].includes(options.action)) action = 'UPDATE'
      else if (['removeRecord'].includes(options.action)) action = 'REMOVE'
      else if (['findAllRecord'].includes(options.action)) action = 'EXPORT'
      if (!action) return

      const allowed = await this.isActionAllowed(action, model, req)
      if (!allowed) throw this.error('accessDenied', { statusCode: 403 })
    }

    /**
     * Check if the specified action is allowed for the given model and request. It retrieves the action guards, filters them based on the site ID, model name, and team IDs, and checks if the action is included in the allowed values. If any guard denies the action, it returns false; otherwise, it returns true.
     *
     * @async
     * @method
     * @param {string} action - The action to check. Available actions are: 'READ', 'CREATE', 'UPDATE', 'REMOVE' and 'EXPORT'.
     * @param {object} model - The model object.
     * @param {object} req - The request object.
     * @returns {Promise<boolean>} - Returns true if the action is allowed, otherwise false.
     */
    isActionAllowed = async (action, model, req) => {
      const { includes } = this.app.lib.aneka
      if (!req) return true
      if (!req.site) return true
      const guards = await this.getActionGuards()
      const { teamIds, aliases } = this.getTeamIdsAndAliases(req)
      if (aliases.includes('administrator')) return true
      const filterFn = item => {
        const bySiteId = item.siteId === req.site.id + ''
        const byModel = item.models.includes(model.name)
        const byTeamId = item.allTeams ? true : includes(item.teamIds, teamIds)
        return bySiteId && byModel && byTeamId
      }
      let denied = false
      for (const item of guards.filter(filterFn)) {
        if (item.value.includes('*')) continue
        if (!item.value.includes(action)) denied = true
      }
      return !denied
    }
  }

  return Sumba
}

export default factory
