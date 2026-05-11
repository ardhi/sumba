async function routeGuard () {
  return {
    connection: 'memory',
    properties: [
      'path,,255,true,true',
      {
        name: 'inverse',
        type: 'boolean',
        required: true,
        default: false
      }, {
        name: 'anonymous',
        type: 'boolean',
        required: true,
        default: false
      }, {
        name: 'methods',
        type: 'array',
        required: true,
        default: ['GET', 'POST', 'UPDATE', 'DELETE'],
        values: ['GET', 'POST', 'UPDATE', 'DELETE']
      }, {
        name: 'teams',
        type: 'array',
        default: [],
        ref: {
          teams: {
            model: 'SumbaTeam',
            field: 'alias',
            searchField: 'name',
            fields: ['alias', 'name']
          }
        }
      }, {
        name: 'weight',
        type: 'smallint',
        default: 0
      }
    ],
    features: [
      {
        name: 'sumba:status',
        values: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
      },
      {
        name: 'dobo:unique',
        fields: ['path', 'anonymous', 'methods', 'teams', 'inverse', 'weight', 'status', 'siteId']
      },
      'dobo:immutable',
      'dobo:updatedAt',
      'sumba:siteId'
    ],
    options: {
      persistence: false
    }
  }
}

export default routeGuard
