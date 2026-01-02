async function userId (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'userId'
  return {
    properties: [{
      name: opts.fieldName,
      type: 'string',
      maxLength: 50,
      ref: {
        site: {
          model: 'SumbaSite',
          propName: 'id',
          type: '1:1'
        },
        user: {
          model: 'SumbaUser',
          propName: 'id',
          type: '1:1',
          fields: ['id', 'username', 'email', 'firstName', 'lastName']
        }
      },
      index: true
    }]
  }
}

export default userId
