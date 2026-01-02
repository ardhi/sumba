async function siteId (opts = {}) {
  return {
    properties: [{
      name: 'siteId',
      type: 'string',
      maxLength: 50,
      ref: {
        site: {
          model: 'SumbaUser',
          propName: 'id',
          type: '1:1'
        }
      },
      index: true
    }]
  }
}

export default siteId
