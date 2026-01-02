async function teamId (opts = {}) {
  return {
    properties: [{
      name: 'teamId',
      type: 'string',
      maxLength: 50,
      ref: {
        site: {
          model: 'SumbaSite',
          propName: 'id',
          type: '1:1'
        }
      },
      index: true
    }]
  }
}

export default teamId
