async function status (opts = {}) {
  opts.field = opts.field ?? 'status'
  opts.required = opts.required ?? true
  opts.default = opts.default ?? 'ACTIVE'
  opts.values = opts.values ?? ['ACTIVE', 'INACTIVE']
  return {
    properties: [{
      name: opts.field ?? 'status',
      type: 'string',
      maxLength: 50,
      index: true,
      default: opts.default,
      required: opts.required,
      values: opts.values
    }],
    hook: {
      beforeCreate: async function (body) {
        const { isSet } = this.app.lib.aneka
        if (!isSet(body[opts.field])) body[opts.field] = opts.default
      }
    }
  }
}

export default status
