async function teamId (opts = {}) {
  return {
    properties: [{
      name: 'teamId',
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

export default teamId
