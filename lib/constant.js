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
