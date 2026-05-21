import { options } from './model-guard.js'

export const properties = [
  'path,,255,true,true',
  {
    name: 'methods',
    type: 'array',
    required: true,
    default: ['GET', 'POST', 'UPDATE', 'DELETE'],
    values: ['GET', 'POST', 'UPDATE', 'DELETE']
  },
  {
    name: 'weight',
    type: 'smallint',
    default: 0
  }, {
    name: 'negation',
    type: 'boolean',
    required: true,
    default: false
  }, {
    name: 'anonymous',
    type: 'boolean',
    required: true,
    default: false
  },
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
    options
  }
}

export default routeGuard
