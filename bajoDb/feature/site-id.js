async function siteId (opts = {}) {
  return {
    properties: [{
      name: 'siteId',
      type: 'string',
      maxLength: 50,
      ref: 'SumbaSite:id',
      index: true
    }]
  }
}

export default siteId
