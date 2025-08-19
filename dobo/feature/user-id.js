async function userId (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'userId'
  return {
    properties: [{
      name: opts.fieldName,
      type: 'string',
      maxLength: 50,
      rel: {
        site: {
          schema: 'SumbaSite',
          propName: 'id',
          type: 'one-to-one'
        },
        user: {
          schema: 'SumbaUser',
          propName: 'id',
          type: 'one-to-one',
          fields: ['id', 'username', 'email', 'firstName', 'lastName']
        }
      },
      index: true
    }]
  }
}

export default userId
