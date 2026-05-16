async function routeGuard () {
  return {
    properties: [
      {
        name: 'models',
        type: 'array',
        required: true
      },
      'hiddenCols,array',
      'teamIds,sumba:teamIds'
    ],
    indexes: [{
      type: 'unique',
      fields: ['models', 'siteId']
    }],
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
    },
    buildEnd: async function (model) {
      const prop = model.properties.find(prop => prop.name === 'models')
      prop.values = this.app.dobo.models.map(model => model.name).sort().map(item => ({ value: item, text: item }))
    }
  }
}

export default routeGuard
