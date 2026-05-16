async function routeGuard () {
  return {
    properties: [
      'path,,255,true,true',
      {
        name: 'methods',
        type: 'array',
        required: true,
        default: ['GET', 'POST', 'UPDATE', 'DELETE'],
        values: ['GET', 'POST', 'UPDATE', 'DELETE']
      },
      'teamIds,sumba:teamIds',
      {
        name: 'weight',
        type: 'smallint',
        default: 0
      }, {
        name: 'inverse',
        type: 'boolean',
        required: true,
        default: false
      }, {
        name: 'anonymous',
        type: 'boolean',
        required: true,
        default: false
      }
    ],
    features: [
      {
        name: 'sumba:status',
        values: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
      },
      'dobo:immutable',
      'dobo:updatedAt',
      'sumba:siteId'
    ],
    options: {
      attachment: false
    }
  }
}

export default routeGuard
