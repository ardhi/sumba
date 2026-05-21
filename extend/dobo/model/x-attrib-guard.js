import { properties, features } from './attrib-guard.js'
import { options, buildEnd } from './model-guard.js'

async function routeGuard () {
  const { isString } = this.app.lib._
  return {
    properties: properties.filter(prop => !isString(prop) || (isString(prop) && !prop.startsWith('teamIds'))),
    features: features.filter(feat => !isString(feat) || (isString(feat) && !['sumba:siteId', 'dobo:updatedAt'].includes(feat))).concat('sumba:siteIds', 'dobo:updatedAt'),
    options,
    buildEnd
  }
}

export default routeGuard
