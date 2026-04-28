async function user () {
  return {
    buildLevel: 2,
    properties: [{
      name: 'username',
      type: 'string',
      minLength: 5,
      maxLength: 50,
      rules: ['alphanum']
    }, {
      name: 'password',
      type: 'string',
      minLength: 8,
      maxLength: 100
    }, {
      name: 'token',
      type: 'string',
      maxLength: 100,
      index: true
    }, {
      name: 'salt',
      type: 'string',
      maxLength: 100,
      required: true
    }, {
      name: 'apiKey',
      type: 'string',
      maxLength: 100,
      virtual: true,
      getValue: async function (val, rec) {
        return await this.plugin.hash(rec.salt)
      }
    }, {
      name: 'provider',
      type: 'string',
      maxLength: 50,
      index: true,
      default: 'local'
    }, {
      name: 'email',
      type: 'string',
      maxLength: 100,
      required: true,
      rules: ['email']
    }, {
      name: 'firstName',
      type: 'string',
      maxLength: 50,
      required: true,
      index: true
    }, {
      name: 'lastName',
      type: 'string',
      maxLength: 50,
      required: true,
      index: true
    }],
    rules: [{ rule: 'trim', fields: ['username', 'firstName', 'lastName'] }],
    indexes: [{
      fields: ['username', 'siteId'],
      type: 'unique'
    }, {
      fields: ['email', 'siteId'],
      type: 'unique'
    }],
    hidden: ['password', 'token'],
    features: [
      'sumba:address',
      'sumba:social',
      {
        name: 'sumba:status',
        default: 'UNVERIFIED',
        values: ['UNVERIFIED', 'ACTIVE', 'INACTIVE']
      },
      'sumba:siteId',
      'dobo:createdAt',
      'dobo:updatedAt',
      'dobo:immutable'
    ]
  }
}

export default user
