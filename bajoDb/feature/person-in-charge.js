const address = {
  addProps: async function (opts) {
    if (!opts) return
    return [{
      name: 'picName',
      type: 'string',
      maxLength: 50,
      index: true
    }, {
      name: 'picRole',
      type: 'string',
      maxLength: 50,
      index: true
    }, {
      name: 'picPhone',
      type: 'string',
      maxLength: 50
    }, {
      name: 'picEmail',
      type: 'string',
      maxLength: 50
    }]
  }
}

export default address
