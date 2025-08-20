async function status (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'status'
  return {
    properties: [{
      name: opts.fieldName ?? 'status',
      type: 'string',
      maxLength: 50,
      index: true,
      values: opts.values ?? ['UNVERIFIED', 'ACTIVE', 'INACTIVE']
    }],
    hook: {
      beforeCreate: async function ({ body }) {
        const { isSet } = this.lib.aneka
        if (!isSet(body[opts.fieldName])) body[opts.fieldName] = opts.default
      }
    }
  }
}

export default status
