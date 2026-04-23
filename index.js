import path from 'path'
import createNewSite from './lib/create-new-site.js'
import removeSite from './lib/remove-site.js'
import getSite from './lib/get-site.js'
import { getUserById, getUserByToken, getUserByUsernamePassword } from './lib/get-user.js'
import { joiPasswordExtendCore } from 'joi-password'

const defMultiSite = {
  enabled: false,
  catchAll: 'default',
  admins: []
}

/**
 * Plugin factory
 *
 * @param {string} pkgName - NPM package name
 * @returns {class}
 */
async function factory (pkgName) {
  const me = this
  const { getModel } = this.app.dobo
  const { cloneDeep } = this.app.lib._

  /**
   * Sumba class
   *
   * @class
   */
  class Sumba extends this.app.baseClass.Base {
    constructor () {
      super(pkgName, me.app)
      this.config = {
        multiSite: cloneDeep(defMultiSite),
        interSiteAdmins: [],
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
              headerKey: 'X-Auth-ApiKey'
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
      this.unsafeUserFields = ['password']
      this.selfBind(['createNewSite', 'removeSite', 'getSite', 'getUserById', 'getUserByToken', 'getUserByUsernamePassword'])
    }

    init = async () => {
      const { getPluginDataDir } = this.app.bajo
      this.downloadDir = `${getPluginDataDir(this.ns)}/download`
      this.app.lib.fs.ensureDirSync(this.downloadDir)
      for (const type of ['secure', 'anonymous', 'team']) {
        this[`${type}Routes`] = this[`${type}Routes`] ?? []
        this[`${type}NegRoutes`] = this[`${type}NegRoutes`] ?? []
      }
      if (this.config.multiSite === true) {
        this.config.multiSite = cloneDeep(defMultiSite)
        this.config.multiSite.enabled = true
      }
    }

    start = async () => {
      const { getModel } = this.app.dobo
      if (this.config.interSiteAdmins.length === 0) {
        const site = await getModel('SumbaSite').findOneRecord({ query: { alias: 'default' } }, { noHook: true })
        const user = await getModel('SumbaUser').findOneRecord({ query: { username: 'admin', siteId: site.id } }, { noHook: true })
        this.config.interSiteAdmins.push(user.id)
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
      const items = [{
        title: 'manageSite',
        children: [
          { title: 'siteProfile', href: `waibuAdmin:/${prefix}/site` },
          { title: 'siteSetting', href: `waibuAdmin:/${prefix}/site-setting/list` },
          { title: 'allSites', href: `waibuAdmin:/${prefix}/all-sites/list` }
        ]
      }, {
        title: 'manageUser',
        children: [
          { title: 'userProfile', href: `waibuAdmin:/${prefix}/user/list` },
          { title: 'userSetting', href: `waibuAdmin:/${prefix}/user-setting/list` },
          { title: 'resetUserPassword', href: `waibuAdmin:/${prefix}/reset-user-password` }
        ]
      }, {
        title: 'manageTeam',
        children: [
          { title: 'teamProfile', href: `waibuAdmin:/${prefix}/team/list` },
          { title: 'teamUser', href: `waibuAdmin:/${prefix}/team-user/list` },
          { title: 'teamSetting', href: `waibuAdmin:/${prefix}/team-setting/list` }
        ]
      }, {
        title: 'supportSystem',
        children: [
          { title: 'contactForm', href: `waibuAdmin:/${prefix}/contact-form/list` },
          { title: 'contactFormCat', href: `waibuAdmin:/${prefix}/contact-form-cat/list` },
          { title: 'ticket', href: `waibuAdmin:/${prefix}/ticket/list` },
          { title: 'ticketCat', href: `waibuAdmin:/${prefix}/ticket-cat/list` }
        ]
      }, {
        title: 'misc',
        children: [
          { title: 'manageDownload', href: `waibuAdmin:/${prefix}/download/list` },
          { title: 'userSession', href: `waibuAdmin:/${prefix}/session/list` }
        ]
      }]
      if (this.app.bajoCache) {
        const item = items.find(i => i.title === 'misc')
        if (item) item.children.push({ title: 'cacheStorage', href: `waibuAdmin:/${prefix}/cache/list` })
      }
      return items
    }

    createJwtFromUserRecord = async (rec) => {
      const { importPkg } = this.app.bajo
      const { dayjs } = this.app.lib
      const { hash } = this.app.bajoExtra
      const { get, pick } = this.app.lib._

      const fastJwt = await importPkg('bajoExtra:fast-jwt')
      const { createSigner } = fastJwt

      const opts = pick(this.config.auth.common.jwt, ['expiresInDur'])
      opts.key = get(this.config, 'auth.common.jwt.secret')
      const sign = createSigner(opts)
      const apiKey = await hash(rec.password)
      const payload = { uid: rec.id, apiKey }
      const token = await sign(payload)
      const expiresAt = dayjs().add(opts.expiresInDur).toDate()
      return { token, expiresAt }
    }

    verifySession = async (req, reply, source, payload) => {
      const { routePath } = this.app.waibu

      if (!req.session) return false
      if (req.session.userId) {
        req.user = await this.getUserById(req.session.userId, req)
        return true
      }
      const redir = routePath(this.config.redirect.signin, req)
      req.session.ref = req.url
      throw this.error('_redirect', { redirect: redir })
    }

    verifyApiKey = async (req, reply, source, payload) => {
      const { merge } = this.app.lib._
      const { isMd5, hash } = this.app.bajoExtra

      let token = await this._getToken('apiKey', req, source)
      if (!isMd5(token)) return false
      token = await hash(token)
      const user = await this.getUserByToken(token, req)
      if (!user) throw this.error('invalidKey', merge({ statusCode: 401 }, payload))
      if (user.status !== 'ACTIVE') throw this.error('userInactive', merge({ details: [{ field: 'status', error: 'inactive' }], statusCode: 401 }, payload))
      req.user = user
      return true
    }

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

      const setting = await this._getSetting('basic', source)
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

    verifyJwt = async (req, reply, source, payload) => {
      const { importPkg } = this.app.bajo
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
      const resp = await getModel('SumbaUser').getRecord(id, options)
      return await hash(resp.salt)
    }

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
     * @returns
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

    resetToken = async (salt) => {
      const { generateId } = this.app.lib.aneka
      const { hash } = this.app.bajoExtra
      salt = salt ?? generateId()
      const token = await hash(await hash(salt))
      return { salt, token }
    }

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

    parseRouteGuard = item => {
      const { routePath, routePathHandlers } = this.app.waibu
      const { isString, isEmpty } = this.app.lib._
      if (isString(item)) {
        let [path, methods] = item.split('|').map(i => i.trim())
        methods = isEmpty(methods) ? ['*'] : methods.split(',').map(i => i.trim())
        item = { path, methods }
      }
      item.methods = item.methods ?? ['*']
      if (item.methods.includes('*')) item.methods = ['*']
      const [, routeHandler] = item.path.split(':')[0].split('.')
      if (!isEmpty(routeHandler) && !routePathHandlers[routeHandler]) return
      const rns = isEmpty(routeHandler) ? 'waibuMpa' : routePathHandlers[routeHandler].ns
      if (!this.app[rns]) return
      item.inverse = item.path[0] === '!'
      if (item.inverse) item.path = item.path.slice(1)
      item.path = routePath(item.path, { defFormat: false })
      return item
    }

    createNewSite = createNewSite
    removeSite = removeSite
    getSite = getSite
    getUserById = getUserById
    getUserByToken = getUserByToken
    getUserByUsernamePassword = getUserByUsernamePassword
  }

  return Sumba
}

export default factory
