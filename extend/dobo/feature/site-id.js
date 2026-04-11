async function siteId (opts = {}) {
  return {
    properties: [{
      name: 'siteId',
      type: 'string',
      maxLength: 50,
      ref: {
        siteDetail: {
          model: 'SumbaSite',
          field: 'id',
          type: '1:1'
        }
      },
      index: true
    }]
  }
}

export default siteId
