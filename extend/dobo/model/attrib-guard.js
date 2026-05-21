import { buildEnd, options } from './model-guard.js'

export const properties = [
  {
    name: 'models',
    type: 'array',
    required: true
  },
  'hiddenCols,array',
  'siteId,sumba:siteId',
  'teamIds,sumba:teamIds'
]

export const features = [
  {
    name: 'sumba:status',
    values: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
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
