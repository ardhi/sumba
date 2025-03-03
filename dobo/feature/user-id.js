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
          type: 'one-on-one'
        }
      },
      index: true
    }]
  }
}

export default userId
