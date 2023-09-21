const address = {
  addProps: async function (opts) {
    if (opts === true) opts = { fieldName: 'status' }
    return {
      name: opts.fieldName ?? 'status',
      type: 'string',
      maxLength: 50,
      index: true
    }
  },
  hook: {
    beforeCreate: async function ({ schema, body }) {
      const { isSet, importPkg } = this.bajo.helper
      const { get } = await importPkg('lodash-es')
      const def = get(schema, 'feature.sumbaStatus.default')
      const field = get(schema, 'feature.sumbaStatus.fieldName', 'status')
      if (!isSet(body[field])) body[field] = def
    }
  }
}

export default address
