const buildEnd = async function (model) {
  const prop = model.properties.find(prop => prop.name === 'models')
  if (prop) prop.values = this.getModelNames(true)
}

const options = {
  attachment: false,
  cache: { ttlDur: 0 }
}

const allTeams = {
  name: 'allTeams',
  type: 'boolean',
  default: true,
  required: true
}

const routeGuard = {
  properties: [
    {
      name: 'path',
      maxLength: 255,
      required: true
    },
    allTeams,
    'teamIds,sumba:teamIds',
    {
      name: 'weight',
      type: 'smallint',
      index: true,
      default: 0
    },
    'siteId,sumba:siteId'
  ],
  features: [
    'sumba:status',
    'dobo:updatedAt',
    'dobo:immutable'
  ],
  indexes: [{
    type: 'unique',
    fields: ['siteId', 'path']
  }],
  options: { ...options }
}

async function model () {
  const { merge, cloneDeep } = this.app.lib._
  return [{
    baseName: 'attrib-guard',
    properties: [
      {
        name: 'models',
        type: 'array',
        required: true
      },
      'hiddenFields,array',
      allTeams,
      'teamIds,sumba:teamIds',
      'siteId,sumba:siteId'
    ],
    features: [
      'sumba:status',
      'dobo:updatedAt',
      'dobo:immutable'
    ],
    options: { ...options },
    buildEnd
  }, {
    baseName: 'model-guard',
    properties: [
      {
        name: 'models',
        type: 'array',
        required: true
      },
      'field,,50,true,true',
      {
        name: 'behavior',
        type: 'string',
        maxLength: 20,
        required: true,
        values: ['IN', 'NIN'],
        default: 'IN'
      },
      'value,array,,,true',
      allTeams,
      'teamIds,sumba:teamIds',
      'siteId,sumba:siteId'
    ],
    features: [
      'sumba:status',
      'dobo:updatedAt',
      'dobo:immutable'
    ],
    options: { ...options },
    buildEnd
  },
  merge(cloneDeep(routeGuard), { baseName: 'anonymous-guard' }),
  merge(cloneDeep(routeGuard), { baseName: 'secure-guard' }),
  {
    buildLevel: 2,
    baseName: 'user',
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
        if (!rec.salt) return
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
    hidden: ['password'],
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
    ],
    hooks: [{
      name: 'afterRecordValidation',
      handler: async function (body, options) {
        const { isBcrypt, hash } = this.app.bajoExtra
        const { has } = this.app.lib._

        if (has(body, 'password') && !isBcrypt(body.password)) body.password = await hash(body.password, 'bcrypt')
      }
    }, {
      name: 'beforeCreateRecord',
      handler: async function (body, options = {}) {
        const { token, salt } = await this.plugin.resetToken()
        body.token = token
        body.salt = salt
      }
    }, {
      name: 'beforeRecordValidation',
      handler: async function (body, options = {}) {
        const { set } = this.app.lib._
        const password = await this.plugin.passwordRule(options.req)
        const rule = { password }
        set(options, 'validation.params.rule', rule)
      }
    }, {
      name: 'beforeUpdateRecord',
      handler: async function (id, body, options = {}) {
        if (body.salt) {
          const { token, salt } = await this.plugin.resetToken(body.salt)
          body.token = token
          body.salt = salt
        }
      }
    }]
  }, {
    baseName: 'ticket',
    properties: [
      'subject,,255,true,true',
      {
        name: 'cat',
        type: 'string',
        maxLength: 50,
        index: true,
        required: true,
        values: async function ({ req } = {}) {
          const { getModel } = this.app.dobo
          const model = await getModel('SumbaTicketCat')
          const opts = { req, noMagic: true, dataOnly: true, fields: ['name'] }
          const results = await model.findAllRecords({ sort: { level: 1, name: 1 } }, opts)
          return results.map(r => r.name)
        }
      },
      'message,text,,,true'
    ],
    features: [
      'dobo:createdAt',
      'dobo:updatedAt',
      'sumba:siteId',
      'sumba:userId',
      {
        name: 'sumba:status',
        default: 'OPEN',
        values: ['OPEN', 'CLOSED']
      }
    ]
  }]
}

export default model
