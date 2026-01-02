async function country (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'country'
  return {
    properties: [{
      name: opts.fieldName,
      type: 'string',
      maxLength: 2,
      index: opts.index ?? true,
      rules: ['uppercase', { rule: 'length', params: 2 }]
    }],
    rules: [{ rule: 'trim', fields: [opts.fieldName] }]
  }
}

export default country
