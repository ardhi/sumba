async function userId (opts = {}) {
  return {
    properties: [{
      name: 'userId',
      type: 'string',
      maxLength: 50,
      ref: {
        user: {
          model: 'SumbaUser',
          propName: 'id',
          type: '1:1'
        }
      },
      index: true
    }]
  }
}

export default userId
