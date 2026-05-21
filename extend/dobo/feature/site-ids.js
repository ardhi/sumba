async function siteIds (opts = {}) {
  return {
    properties: [{
      name: 'siteIds',
      type: 'array',
      default: [],
      ref: {
        siteIds: {
          model: 'SumbaSite',
          field: 'id',
          searchField: 'hostname',
          fields: ['id', 'hostname']
        }
      }
    }]
  }
}

export default siteIds
