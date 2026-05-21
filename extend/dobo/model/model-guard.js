export async function buildEnd (model) {
  const prop = model.properties.find(prop => prop.name === 'models')
  if (prop) prop.values = this.app.sumba.getModelNames(true)
}

export const properties = [
  {
    name: 'models',
    type: 'array',
    required: true
  },
  'column,,50,true,true',
  {
    name: 'negation',
    type: 'boolean',
    required: true,
    default: false
  },
  {
    name: 'status',
    type: 'sumba:status',
    values: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  'value,array,,,true',
  'siteId,sumba:siteId',
  'teamIds,sumba:teamIds'
]

export const options = {
  attachment: false,
  cache: { ttlDur: 0 }
}

export const features = [
  'dobo:updatedAt'
]

async function routeGuard () {
  return {
    properties,
    features,
    options,
    buildEnd
  }
}

export default routeGuard
