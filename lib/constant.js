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
 * @property {string} [config.waibuMpa.icon='globe'] - Waibu MPA icon. Default: 'globe'
 * @property {object} [config.waibuMpa.redirect={}] - Waibu MPA route redirection
 * @property {object} [config.waibuMpa.redirectSubRoute={}] - Waibu MPA sub-route redirection
 * @property {array} [config.waibuMpa.menuHandler=[]] - Waibu MPA menu handler
 * @property {object} [config.waibuAdmin={}] - Waibu Admin configuration object
 * @property {string} [config.waibuAdmin.menuHandler='sumba:adminMenu'] - Waibu Admin menu handler. Default: 'sumba:adminMenu'
 * @property {boolean} [config.waibuAdmin.menuCollapsible=true] - Whether the Waibu Admin menu is collapsible or not. Default: true
 * @property {object} [config.auth={}] - Authentication configuration object
 * @property {object} [config.auth.common={}] - Common authentication configuration object
 * @property {object} [config.auth.common.apiKey={}] - API Key authentication configuration object
 * @property {string} [config.auth.common.apiKey.type='Bearer'] - API Key authentication type. Default: 'Bearer'
 * @property {string} [config.auth.common.apiKey.qsKey='apiKey'] - API Key authentication query string key. Default: 'apiKey'
 * @property {string} [config.auth.common.apiKey.headerKey='X-Auth-ApiKey'] - API Key authentication header key. Default: 'X-Auth-ApiKey'
 * @property {string} [config.auth.common.apiKey.algo='sha256'] - API Key authentication hashing algorithm. Default: 'sha256'
 * @property {object} [config.auth.common.basic={}] - Basic authentication configuration object
 * @property {object} [config.auth.common.jwt={}] - JWT authentication configuration object
 * @property {string} [config.auth.common.jwt.type='Bearer'] - JWT authentication type. Default: 'Bearer'
 * @property {string} [config.auth.common.jwt.qsKey='token'] - JWT authentication query string key. Default: 'token'
 * @property {string} [config.auth.common.jwt.headerKey='X-Auth-Jwt'] - JWT authentication header key. Default: 'X-Auth-Jwt'
 * @property {string} [config.auth.common.jwt.secret] - JWT authentication secret. Default: hard coded value, should be changed in production
 * @property {string} [config.auth.common.jwt.expiresInDur='7d'] - JWT authentication token expiration duration. Default: '7d'
 * @property {object} [config.auth.waibuRestApi={}] - Waibu REST API authentication configuration object
 * @property {array} [config.auth.waibuRestApi.methods=['basic', 'apiKey', 'jwt']] - Waibu REST API authentication methods. Default: ['basic', 'apiKey', 'jwt']
 * @property {boolean} [config.auth.waibuRestApi.silentOnError=false] - Whether to silently ignore authentication errors or not. Default: false
 * @property {object} [config.auth.waibuMpa={}] - Waibu MPA authentication configuration object
 * @property {array} [config.auth.waibuMpa.methods=['session']] - Waibu MPA authentication methods. Default: ['session']
 * @property {boolean} [config.auth.waibuMpa.silentOnError=false] - Whether to silently ignore authentication errors or not. Default: false
 * @property {object} [config.auth.waibuStatic={}] - Waibu Static authentication configuration object
 * @property {array} [config.auth.waibuStatic.methods=['basic', 'apiKey', 'jwt']]
 * @property {object} [config.auth.waibuStatic.basic={}] - Waibu Static Basic authentication configuration object
 * @property {boolean} [config.auth.waibuStatic.basic.useUtf8=true] - Whether to use UTF-8 encoding for Basic authentication or not. Default: true
 * @property {boolean} [config.auth.waibuStatic.basic.realm=true] - Whether to use realm for Basic authentication or not. Default: true
 * @property {string} [config.auth.waibuStatic.basic.warningMessage='pleaseAuthenticate'] - Warning message for Basic authentication. Default: 'pleaseAuthenticate'
 * @property {boolean} [config.auth.waibuStatic.silentOnError=false] - Whether to silently ignore authentication errors or not. Default: false
 * @property {object} [config.redirect={}] - Redirection configuration object
 */

/**
 * @typedef {object} TTokenData
 * @type {object}
 * @property {object} data - The token data object
 * @property {string} data.token - The token string
 * @property {string} data.expiresAt - The expiration date of the token
 * @property {boolean} success - Indicates if the operation was successful
 * @property {number} statusCode - The HTTP status code of the response
 */
export const data = {
  data: {
    type: 'object',
    properties: {
      token: { type: 'string' },
      expiresAt: { type: 'string' }
    }
  },
  success: {
    type: 'boolean',
    default: true
  },
  statusCode: {
    type: 'integer',
    default: 200
  }
}

/**
 * @typedef {object} TTokenBody
 * @type {object}
 * @property {string} username - The username of the user
 * @property {string} password - The password of the user
 */
export const body = {
  type: 'object',
  properties: {
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  }
}
