async function siteId (opts = {}) {
  return {
    properties: [{
      name: 'siteId',
      type: 'string',
      maxLength: 50,
      rel: {
        site: {
          schema: 'SumbaSite',
          propName: 'id',
          fields: 'all'
        }
      },
      index: true
    }]
  }
}

export default siteId
