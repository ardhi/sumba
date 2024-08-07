async function hook (schema, body, options) {
  const { isSet } = this.app.bajo
  let val = body[options.fieldName]
  if (!isSet(val)) return
  const [, ...params] = val.split('://')
  if (params.length === 0) val = options.defProto + '://' + val
  body[options.fieldName] = val
}

async function url (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'url'
  opts.defProto = opts.defProto ?? 'http'
  return {
    properties: [{
      name: opts.fieldName ?? 'url',
      type: 'string'
    }],
    hook: {
      beforeCreate: async function ({ schema, body }) {
        await hook.call(this, schema, body, opts)
      },
      beforeUpdate: async function ({ schema, body }) {
        await hook.call(this, schema, body, opts)
      }
    }
  }
}

export default url
