const buildEnd = async function (model) {
  const prop = model.properties.find(prop => prop.name === 'models')
  if (prop) prop.values = this.getModelNames(true)
}

const mgProperties = [
  {
    name: 'models',
    type: 'array',
    required: true
  },
  'column,,50,true,true',
  {
    name: 'negation',
    type: 'boolean',
    required: true,
    default: false
  },
  {
    name: 'status',
    type: 'sumba:status',
    values: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  'value,array,,,true',
  'siteId,sumba:siteId',
  'teamIds,sumba:teamIds'
]

const options = {
  attachment: false,
  cache: { ttlDur: 0 }
}

const mgFeatures = [
  'dobo:updatedAt'
]

const agProperties = [
  {
    name: 'models',
    type: 'array',
    required: true
  },
  'hiddenCols,array',
  'siteId,sumba:siteId',
  'teamIds,sumba:teamIds'
]

const agFeatures = [
  {
    name: 'sumba:status',
    values: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  'dobo:updatedAt'
]

export const rgProperties = [
  'path,,255,true,true',
  {
    name: 'methods',
    type: 'array',
    required: true,
    default: ['GET', 'POST', 'UPDATE', 'DELETE'],
    values: ['GET', 'POST', 'UPDATE', 'DELETE']
  },
  {
    name: 'weight',
    type: 'smallint',
    default: 0
  }, {
    name: 'negation',
    type: 'boolean',
    required: true,
    default: false
  }, {
    name: 'anonymous',
    type: 'boolean',
    required: true,
    default: false
  },
  'siteId,sumba:siteId',
  'teamIds,sumba:teamIds'
]

export const rgFeatures = [
  {
    name: 'sumba:status',
    values: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  'dobo:updatedAt'
]

async function model () {
  const { isString } = this.app.lib._
  return [{
    baseName: 'route-guard',
    properties: rgProperties,
    features: rgFeatures,
    options
  }, {
    baseName: 'x-route-guard',
    properties: rgProperties.filter(prop => {
      if (!isString(prop)) return true
      return !(prop.startsWith('teamIds') || prop.startsWith('siteId'))
    }).concat('siteIds,sumba:siteIds'),
    features: rgFeatures,
    options
  }, {
    baseName: 'attrib-guard',
    properties: agProperties,
    features: agFeatures,
    options,
    buildEnd
  }, {
    baseName: 'x-attrib-guard',
    properties: agProperties.filter(prop => {
      if (!isString(prop)) return true
      return !(prop.startsWith('teamIds') || prop.startsWith('siteId'))
    }).concat('siteIds,sumba:siteIds'),
    features: agFeatures,
    options,
    buildEnd
  }, {
    baseName: 'model-guard',
    properties: mgProperties,
    features: mgFeatures,
    options,
    buildEnd
  }, {
    baseName: 'x-model-guard',
    properties: mgProperties.filter(prop => {
      if (!isString(prop)) return true
      return !(prop.startsWith('teamIds') || prop.startsWith('siteId'))
    }).concat('siteIds,sumba:siteIds'),
    features: mgFeatures,
    options,
    buildEnd
  }, {
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
