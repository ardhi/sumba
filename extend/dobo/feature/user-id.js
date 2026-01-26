async function userId (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'userId'
  return {
    properties: [{
      name: opts.fieldName,
      type: 'string',
      maxLength: 50,
      ref: {
        user: {
          model: 'SumbaUser',
          propName: 'id',
          type: '1:1'
        }
      },
      index: true
    }]
  }
}

export default userId
