async function phone (opts = {}) {
  opts.field = opts.field ?? 'phone'
  return {
    properties: [{
      name: opts.field ?? 'phone',
      type: 'string',
      maxLength: opts.maxLength ?? 50
    }]
  }
}

export default phone
