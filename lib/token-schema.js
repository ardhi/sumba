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
