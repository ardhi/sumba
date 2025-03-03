async function roleId (opts = {}) {
  return {
    properties: [{
      name: 'roleId',
      type: 'string',
      maxLength: 50,
      rel: {
        site: {
          schema: 'SumbaSite',
          propName: 'id',
          type: 'one-to-one'
        }
      },
      index: true
    }]
  }
}

export default roleId
