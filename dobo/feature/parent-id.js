async function parentId (opts = {}) {
  return {
    properties: [{
      name: 'parentId',
      type: 'string',
      maxLength: 50,
      rel: {
        site: {
          schema: 'SumbaSite',
          propName: 'id',
          type: 'one-to-one'
        }
      },
      index: true
    }]
  }
}

export default parentId
