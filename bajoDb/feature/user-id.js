const userId = {
  addProps: async function (opts) {
    if (!opts) return
    return [{
      name: 'userId',
      type: 'string',
      maxLength: 50,
      index: true
    }]
  }
}

export default userId
