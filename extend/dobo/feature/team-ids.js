async function teamIds (opts = {}) {
  return {
    properties: [{
      name: 'teamIds',
      type: 'array',
      default: [],
      ref: {
        teamIds: {
          model: 'SumbaTeam',
          field: 'id',
          searchField: 'name',
          fields: ['id', 'alias', 'name']
        }
      },
      index: true
    }]
  }
}

export default teamIds
