export const defMultiSite = {
  enabled: false,
  catchAll: 'default'
}

/**
 * Sumba configuration object
 *
 * @typedef {object} TConfig
 * @type {object}
 * @property {object} [config={}] - Configuration object
 * @property {object} [config.multiSite={}] - Multi-site configuration object
 * @property {boolean} [config.multiSite.enabled=false] - Whether multi-site is enabled or not. Default: false
 * @property {string} [config.multiSite.catchAll='default'] - Which site alias to use as the catch-all. Default: 'default'
 * @property {array} [config.xSiteAdmins=[]] - List of cross-site administrators. Format: "<siteAlias>:<username>"
 * @property {object} [config.waibu={}] - Waibu configuration object
 * @property {string} [config.waibu.prefix='site'] - Waibu prefix
 * @property {string} [config.waibu.title='site'] - Waibu title
 * @property {object} [config.waibuMpa={}] - Waibu MPA configuration object
 * @property {object} [config.waibuMpa.auth={}] - Waibu MPA authentication configuration object
 * @property {array} [config.waibuMpa.auth.methods=['session']] - Waibu MPA authentication methods. Default: ['session']
 * @property {boolean} [config.waibuMpa.auth.silentOnError=false] - Whether to silently ignore authentication errors or not. Default: false
 * @property {string} [config.waibuMpa.icon='globe'] - Waibu MPA icon. Default: 'globe'
 * @property {object} [config.waibuMpa.redirect={}] - Waibu MPA route redirection
 * @property {object} [config.waibuMpa.redirectSubRoute={}] - Waibu MPA sub-route redirection
 * @property {object} [config.waibuRestApi={}] - Waibu REST API configuration object
 * @property {object} [config.waibuRestApi.auth={}] - Waibu REST API authentication configuration object
 * @property {array} [config.waibuRestApi.auth.methods=['basic', 'apiKey', 'jwt']] - Waibu REST API authentication methods. Default: ['basic', 'apiKey', 'jwt']
 * @property {boolean} [config.waibuRestApi.auth.silentOnError=false] - Whether to silently ignore authentication errors or not. Default: false
 * @property {object} [config.waibuStatic={}] - Waibu Static configuration object
 * @property {object} [config.waibuStatic.auth={}] - Waibu Static authentication configuration object
 * @property {array} [config.waibuStatic.auth.methods=['basic', 'apiKey', 'jwt']]
 * @property {object} [config.waibuStatic.auth.basic={}] - Waibu Static Basic authentication configuration object
 * @property {boolean} [config.waibuStatic.auth.basic.useUtf8=true] - Whether to use UTF-8 encoding for Basic authentication or not. Default: true
 * @property {boolean} [config.waibuStatic.auth.basic.realm=true] - Whether to use realm for Basic authentication or not. Default: true
 * @property {string} [config.waibuStatic.auth.basic.warningMessage='pleaseAuthenticate'] - Warning message for Basic authentication. Default: 'pleaseAuthenticate'
 * @property {boolean} [config.waibuStatic.auth.silentOnError=false] - Whether to silently ignore authentication errors or not. Default: false
 * @property {array} [config.waibuMpa.menuHandler=[]] - Waibu MPA menu handler
 * @property {object} [config.waibuAdmin={}] - Waibu Admin configuration object
 * @property {string} [config.waibuAdmin.menuHandler='sumba:adminMenu'] - Waibu Admin menu handler. Default: 'sumba:adminMenu'
 * @property {boolean} [config.waibuAdmin.menuCollapsible=true] - Whether the Waibu Admin menu is collapsible or not. Default: true
 * @property {object} [config.auth={}] - Authentication configuration object
 * @property {object} [config.auth.apiKey={}] - API Key authentication configuration object
 * @property {string} [config.auth.apiKey.type='Bearer'] - API Key authentication type. Default: 'Bearer'
 * @property {string} [config.auth.apiKey.qsKey='apiKey'] - API Key authentication query string key. Default: 'apiKey'
 * @property {string} [config.auth.apiKey.headerKey='X-Auth-ApiKey'] - API Key authentication header key. Default: 'X-Auth-ApiKey'
 * @property {string} [config.auth.apiKey.algo='sha256'] - API Key authentication hashing algorithm. Default: 'sha256'
 * @property {object} [config.auth.basic={}] - Basic authentication configuration object
 * @property {object} [config.auth.jwt={}] - JWT authentication configuration object
 * @property {string} [config.auth.jwt.type='Bearer'] - JWT authentication type. Default: 'Bearer'
 * @property {string} [config.auth.jwt.qsKey='token'] - JWT authentication query string key. Default: 'token'
 * @property {string} [config.auth.jwt.headerKey='X-Auth-Jwt'] - JWT authentication header key. Default: 'X-Auth-Jwt'
 * @property {string} [config.auth.jwt.secret] - JWT authentication secret. Default: hard coded value, should be changed in production
 * @property {string} [config.auth.jwt.expiresInDur='7d'] - JWT authentication token expiration duration. Default: '7d'
 * @property {object} [config.redirect={}] - Redirection configuration object
 */

async function configFactory () {
  const { cloneDeep } = this.app.lib._
  const config = {
    multiSite: cloneDeep(defMultiSite),
    xSiteAdmins: [], // format: "<siteAlias>:<username>"
    waibu: {
      title: 'site',
      prefix: 'site'
    },
    dobo: {
      model: {}
    },
    waibuRestApi: {
      auth: {
        methods: ['basic', 'apiKey', 'jwt'],
        silentOnError: false
      }
    },
    waibuStatic: {
      auth: {
        methods: ['basic', 'apiKey', 'jwt'],
        basic: {
          useUtf8: true,
          realm: true,
          warningMessage: 'pleaseAuthenticate'
        },
        silentOnError: false
      }
    },
    waibuMpa: {
      icon: 'globe',
      auth: {
        methods: ['session'],
        silentOnError: false
      },
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

  return config
}

export default configFactory
