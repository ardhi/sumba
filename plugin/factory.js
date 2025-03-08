async function getSetting (type, source) {
  const { defaultsDeep } = this.app.bajo
  const { get } = this.app.bajo.lib._

  const setting = defaultsDeep(get(this.config, `auth.${source}.${type}`, {}), get(this.config, `auth.common.${type}`, {}))
  if (type === 'basic') setting.type = 'Basic'
  return setting
}

async function getToken (type, req, source) {
  const { isEmpty } = this.app.bajo.lib._

  const setting = await getSetting.call(this, type, source)
  let token = req.headers[setting.headerKey.toLowerCase()]
  if (!['basic'].includes(type) && isEmpty(token)) token = req.query[setting.qsKey]
  if (isEmpty(token)) {
    const parts = (req.headers.authorization || '').split(' ')
    if (parts[0] === setting.type) token = parts[1]
  }
  if (isEmpty(token)) return false
  return token
}

async function factory (pkgName) {
  const me = this

  return class Sumba extends this.lib.BajoPlugin {
    constructor () {
      super(pkgName, me.app)
      this.alias = 'sumba'
      this.dependencies = ['waibu', 'waibu-db', 'bajo-extra', 'bajo-common-db']
      this.config = {
        multiSite: false,
        waibu: {
          title: 'Sumba',
          prefix: 'site'
        },
        waibuMpa: {
          home: 'sumba:/my-stuff/profile',
          icon: 'globe',
          redirect: {
            '/': 'sumba:/my-stuff/profile',
            '/my-stuff': 'sumba:/my-stuff/profile',
            '/info': 'sumba:/info/about-us',
            '/user': 'sumba:/my-stuff/profile',
            '/db/export': 'sumba:/db/export/list',
            '/help': 'sumba:/help/contact-form',
            '/help/trouble-tickets': 'sumba:/help/trouble-tickets/list'
          }
        },
        waibuAdmin: {
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
            methods: ['basic', 'apiKey', 'jwt']
          },
          waibuMpa: {
            methods: ['session']
          },
          waibuStatic: {
            methods: ['basic', 'apiKey', 'jwt'],
            basic: {
              useUtf8: true,
              realm: 'Protected Area',
              warningMessage: 'Please authenticate yourself, thank you!'
            }
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

    hasColumn = async (name, model) => {
      const { getInfo } = this.app.dobo
      const { find } = this.app.bajo.lib._
      const { schema } = getInfo(model)

      const result = find(schema.properties, { name })
      return !!result
    }

    getUser = async (rec, safe = true) => {
      const { recordGet } = this.app.dobo
      const { omit, isPlainObject } = this.app.bajo.lib._

      let user
      if (isPlainObject(rec)) user = rec
      else user = await recordGet('SumbaUser', rec, { noHook: true })
      return safe ? omit(user, this.unsafeUserFields) : user
    }

    getUserFromUsernamePassword = async (username = '', password = '', req) => {
      const { importPkg } = this.app.bajo
      const { recordFind, validate } = this.app.dobo
      const model = 'SumbaUser'
      await validate({ username, password }, model, { ns: ['sumba', 'dobo'], fields: ['username', 'password'] })
      const bcrypt = await importPkg('bajoExtra:bcrypt')

      const query = { username }
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
      const { dayjs } = this.app.bajo.lib
      const { hash } = this.app.bajoExtra
      const { get, pick } = this.app.bajo.lib._

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

    // based on: https://medium.com/@paulohfev/problem-solving-how-to-create-an-excerpt-fdb048687928
    createExcerpt = (content, maxWords = 100, trailChars = '...') => {
      const listOfWords = content.trim().split(' ')
      const truncatedContent = listOfWords.slice(0, maxWords).join(' ')
      const excerpt = truncatedContent + trailChars
      const output = listOfWords.length > maxWords ? excerpt : content
      return output
    }

    verifySession = async (req, reply, source) => {
      const { getUser } = this
      const { routePath } = this.app.waibu

      if (!req.session) return false
      if (req.session.user) {
        req.user = await getUser(req.session.user.id)
        return true
      }
      const redir = routePath(this.config.redirect.signin, req)
      req.session.ref = req.url
      throw this.error('_redirect', { redirect: redir })
    }

    verifyApiKey = async (req, reply, source) => {
      const { isMd5, hash } = this.app.bajoExtra
      const { getUser } = this
      const { recordFind } = this.app.dobo

      let token = await getToken.call(this, 'apiKey', req, source)
      if (!isMd5(token)) return false
      token = await hash(token)
      const query = { token }
      const rows = await recordFind('SumbaUser', { query }, { req, noHook: true })
      if (rows.length === 0) throw this.error('invalidKey', { statusCode: 401 })
      if (rows[0].status !== 'ACTIVE') throw this.error('userInactive', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
      req.user = await getUser(rows[0])
      return true
    }

    verifyBasic = async (req, reply, source) => {
      const { getUserFromUsernamePassword } = this
      const { getUser } = this
      const { isEmpty } = this.app.bajo.lib._

      const setHeader = async (setting, reply) => {
        const { isString } = this.app.bajo.lib._

        let header = setting.type
        const exts = []
        if (isString(setting.realm)) exts.push(`realm="${setting.realm}"`)
        if (setting.useUtf8) exts.push('charset="UTF-8"')
        if (exts.length > 0) header += ` ${exts.join(', ')}`
        reply.header('WWW-Authenticate', header)
        reply.code(401)
      }

      const setting = await getSetting.call(this, 'basic', source)
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
        throw err
      }
      return true
    }

    verifyJwt = async (req, reply, source) => {
      const { importPkg } = this.app.bajo
      const { recordGet } = this.app.dobo
      const { getUser } = this
      const { isEmpty } = this.app.bajo.lib._

      const fastJwt = await importPkg('bajoExtra:fast-jwt')
      const { createVerifier } = fastJwt
      const setting = await getSetting.call(this, 'jwt', source)
      const token = await getToken.call(this, 'jwt', req, source)
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
        return true
      } catch (err) {
        return false
      }
    }

    checkPathsByTeam = ({ paths = [], method = 'GET', teams = [], guards = [] }) => {
      const { includes } = this.app.bajo
      const { outmatch } = this.app.bajo.lib

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
      const { outmatch } = this.app.bajo.lib

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
      const { outmatch } = this.app.bajo.lib
      const matcher = outmatch(guards)
      let guarded
      for (const path of paths) {
        if (!guarded) guarded = matcher(path)
      }
      return guarded
    }
  }
}

export default factory
