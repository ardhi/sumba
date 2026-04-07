async function email (opts = {}) {
  opts.field = opts.field ?? 'email'
  return {
    properties: [{
      name: opts.field ?? 'email',
      type: 'string',
      maxLength: 50,
      rules: ['email']
    }]
  }
}

export default email
