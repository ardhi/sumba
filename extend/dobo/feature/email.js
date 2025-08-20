async function email (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'email'
  return {
    properties: [{
      name: opts.fieldName ?? 'email',
      type: 'string',
      maxLength: 50,
      rules: ['email']
    }]
  }
}

export default email
