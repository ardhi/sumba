async function siteId (opts = {}) {
  return {
    properties: [{
      name: 'siteId',
      type: 'string',
      maxLength: 50,
      ref: {
        siteId: {
          model: 'SumbaSite',
          field: 'id',
          searchField: 'hostname',
          fields: ['id', 'hostname']
        }
      },
      index: true
    }]
  }
}

export default siteId
