const address = {
  addProps: async function (opts) {
    if (!opts) return
    return [{
      name: 'status',
      type: 'string',
      maxLength: 50,
      index: true
    }]
  }
}

export default address
