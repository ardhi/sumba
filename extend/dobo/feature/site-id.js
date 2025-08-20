async function siteId (opts = {}) {
  return {
    properties: [{
      name: 'siteId',
      type: 'string',
      maxLength: 50,
      rel: {
        site: {
          schema: 'SumbaUser',
          propName: 'id',
          type: 'one-on-many'
        }
      },
      index: true
    }]
  }
}

export default siteId
