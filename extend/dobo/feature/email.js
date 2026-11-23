async function email (opts = {}) {
  opts.field = opts.field ?? 'email'
  return {
    properties: [{
      name: opts.field ?? 'email',
      type: 'string',
      maxLength: opts.maxLength ?? 100,
      rules: ['email']
    }]
  }
}

export default email
