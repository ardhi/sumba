const siteId = {
  addProps: async function (opts) {
    if (!opts) return
    return [{
      name: 'siteId',
      type: 'string',
      maxLength: 50,
      index: true
    }]
  }
}

export default siteId
