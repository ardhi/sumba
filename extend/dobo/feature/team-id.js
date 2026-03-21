async function teamId (opts = {}) {
  return {
    properties: [{
      name: 'teamId',
      type: 'string',
      maxLength: 50,
      required: true,
      ref: {
        site: {
          model: 'SumbaSite',
          propName: 'id',
          type: '1:1',
          fields: ['id', 'alias', 'hostname', 'title']
        },
        team: {
          model: 'SumbaTeam',
          propName: 'id',
          type: '1:1',
          fields: ['id', 'name']
        }
      },
      index: true
    }]
  }
}

export default teamId
