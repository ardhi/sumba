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
  const { cloneDeep, isEmpty } = this.app.lib._

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
        xSiteAdmins: [], // format: "<siteAlias>:<username>"
        waibu: {
          title: 'site',
          prefix: 'site'
        },
        dobo: {
          model: {}
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
      this.modelGuards = []
      this.attribGuards = []
      this.secureGuards = []
      this.anonymousGuards = []

      this.unsafeUserFields = ['password']
      this.selfBind(['createNewSite', 'removeSite', 'getSite', 'getUserById', 'getUserByToken', 'getUserByUsernamePassword'])
    }

    init = async () => {
      const { getPluginDataDir } = this.app.bajo
      this.downloadDir = `${getPluginDataDir(this.ns)}/download`
      this.app.lib.fs.ensureDirSync(this.downloadDir)
      if (this.config.multiSite === true) {
        this.config.multiSite = cloneDeep(defMultiSite)
        this.config.multiSite.enabled = true
      }
    }

    start = async () => {
      await this.populateRouteGuards()
      if (!this.config.multiSite.enabled) {
        this.config.xSiteAdmins = []
        return
      }
      if (this.config.xSiteAdmins.length === 0) {
        const site = await getModel('SumbaSite').findOneRecord({ query: { alias: 'default' } }, { noMagic: true })
        const user = await getModel('SumbaUser').findOneRecord({ query: { username: 'admin', siteId: site.id } }, { noMagic: true })
        this.config.xSiteAdmins.push(`${site.alias}:${user.username}`)
      }
    }

    populateRouteGuards = async () => {
      const { isString, get, difference } = this.app.lib._
      const { pascalCase } = this.app.lib.aneka
      const { eachPlugins, readConfig, breakNsPath } = this.app.bajo
      const { getModel } = this.app.dobo

      const allNs = this.app.getAllNs()
      const sites = await getModel('SumbaSite').findAllRecord({ query: { status: 'ACTIVE' } }, { noMagic: true, dataOnly: true, fields: ['id', 'hostname'] })

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
          const query = { path: { $in: paths }, siteId: site.id }
          const recs = await model.findAllRecord({ query }, { noMagic: true, dataOnly: true, fields: ['path', 'status'] })
          const spaths = difference(paths, recs.map(rec => rec.path))
          for (const path of spaths) {
            const body = cloneDeep(routes.find(r => r.path === path))
            body.status = 'ACTIVE'
            body.siteId = site.id
            await model.sanitizeFixture({ body, lookupValue: body })
            try {
              await model.createRecord(body, { noMagic: true, noReturn: true })
            } catch (err) {}
          }
        }
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
      const { findIndex } = this.app.lib._
      const prefix = getPluginPrefix(this.ns)
      const params = { action: 'list' }
      const items = [{
        title: 'manageSite',
        children: [
          { title: 'siteProfile', href: `waibuAdmin:/${prefix}/site` },
          { title: 'siteSetting', href: `waibuAdmin:/${prefix}/site-setting/:action`, params }
        ]
      }, {
        title: 'manageUser',
        children: [
          { title: 'userProfile', href: `waibuAdmin:/${prefix}/user/:action`, params },
          { title: 'userSetting', href: `waibuAdmin:/${prefix}/user-setting/:action`, params },
          { title: 'resetUserPassword', href: `waibuAdmin:/${prefix}/reset-user-password` }
        ]
      }, {
        title: 'manageTeam',
        children: [
          { title: 'teamProfile', href: `waibuAdmin:/${prefix}/team/:action`, params },
          { title: 'teamUser', href: `waibuAdmin:/${prefix}/team-user/:action`, params },
          { title: 'teamSetting', href: `waibuAdmin:/${prefix}/team-setting/:action`, params }
        ]
      }, {
        title: 'permission',
        children: [
          { title: 'secureGuard', href: `waibuAdmin:/${prefix}/secure-guard/:action`, params },
          { title: 'anonymousGuard', href: `waibuAdmin:/${prefix}/anonymous-guard/:action`, params },
          { title: 'modelGuard', href: `waibuAdmin:/${prefix}/model-guard/:action`, params },
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
      throw this.error('_redirect', { redirect: redir })
    }

    verifyApiKey = async (req, reply, source, payload) => {
      const { merge, camelCase } = this.app.lib._
      const checker = this.app.bajoExtra[camelCase(`is ${this.config.auth.common.apiKey.algo}`)]

      let token = await this._getToken('apiKey', req, source)
      if (!checker(token)) return false
      token = await this.hash(token)
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

    checkRouteGuard = (guards, paths) => {
      const { outmatch } = this.app.lib
      const all = guards.map(item => item.path)
      const isMatch = outmatch(all)
      return paths.find(isMatch)
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
      const options = { forceNoHidden: true, noHook: true, noCache: true, attachment: true, mimeType: true }
      const resp = await getModel('SumbaUser').getRecord(id, options)
      return await this.hash(resp.salt)
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

    resetToken = async (text) => {
      const { generateId } = this.app.lib.aneka
      const salt = text ?? generateId()
      const token = await this.hash(await this.hash(salt))
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

    hash = async (item) => {
      const { hash } = this.app.bajoExtra
      return await hash(item, this.config.auth.common.apiKey.algo)
    }

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

    _getGuards = (inputs = []) => {
      const { routePath } = this.app.waibu
      const { orderBy } = this.app.lib._
      const normal = orderBy(inputs.filter(input => input.path[0] !== '!').map(result => {
        result.path = routePath(result.path)
        return result
      }), ['weight', 'path'], ['desc', 'asc'])
      const inverse = orderBy(inputs.filter(input => input.path[0] === '!').map(result => {
        result.path = routePath(result.path)
        return result
      }), ['weight', 'path'], ['desc', 'asc'])
      return [...normal, ...inverse]
    }

    getAnonymousGuards = async (reread) => {
      if (!reread) return this.anonymousGuards
      const guards = await this._fetchGuards('Anonymous')
      this.anonymousGuards = this._getGuards(guards)
      return this.anonymousGuards
    }

    getSecureGuards = async (reread) => {
      if (!reread) return this.secureGuards
      const guards = await this._fetchGuards('Secure')
      this.secureGuards = this._getGuards(guards)
      return this.secureGuards
    }

    getModelGuards = async (reread) => {
      if (!reread) return this.modelGuards

      this.modelGuards = await this._fetchGuards('Model')
      return this.modelGuards
    }

    getAttribGuards = async (reread) => {
      if (!reread) return this.attribGuards

      this.attribGuards = await this._fetchGuards('Model')
      return this.attribGuards
    }

    getModelNames = (asValue) => {
      const values = this.app.dobo.models.map(item => item.name).sort()
      return asValue ? values.map(item => ({ value: item, text: item })) : values
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
