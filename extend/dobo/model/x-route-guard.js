import { properties, features } from './route-guard.js'
import { options } from './model-guard.js'

async function xRouteGuard () {
  const { isString } = this.app.lib._
  return {
    properties: properties.filter(prop => !isString(prop) || (isString(prop) && !prop.startsWith('teamIds'))),
    features: features.filter(feat => !isString(feat) || (isString(feat) && !['sumba:siteId', 'dobo:updatedAt'].includes(feat))).concat('sumba:siteIds', 'dobo:updatedAt'),
    options
  }
}

export default xRouteGuard
