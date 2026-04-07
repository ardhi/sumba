async function userId (opts = {}) {
  return {
    properties: [{
      name: 'userId',
      type: 'string',
      maxLength: 50,
      ref: {
        user: {
          model: 'SumbaUser',
          field: 'id',
          labelField: 'username',
          searchField: 'username',
          type: '1:1'
        }
      },
      index: true
    }]
  }
}

export default userId
