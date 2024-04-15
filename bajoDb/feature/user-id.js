async function userId (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'userId'
  return {
    properties: [{
      name: opts.fieldName,
      type: 'string',
      maxLength: 50,
      rel: {
        user: 'SumbaUser:id'
      },
      index: true
    }]
  }
}

export default userId
