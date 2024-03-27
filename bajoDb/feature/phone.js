async function phone (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'phone'
  return {
    properties: [{
      name: opts.fieldName ?? 'phone',
      type: 'string',
      maxLength: 50
    }]
  }
}

export default phone
