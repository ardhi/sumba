import collectRoutes from '../../lib/collect-routes.js'
import collectRoles from '../../lib/collect-roles.js'

async function afterAppBoot () {
  this.log.trace('collectingRouteGuards')
  await collectRoutes.call(this, 'secure')
  await collectRoutes.call(this, 'anonymous')
  this.log.trace('secureRoutes%d', this.secureRoutes.length)
  this.log.trace('secureNegRoutes%d', this.secureNegRoutes.length)
  this.log.trace('anonRoutes%d', this.anonymousRoutes.length)
  this.log.trace('anonNegRoutes%d', this.anonymousNegRoutes.length)
  this.log.trace('collectingRoleGuards')
  await collectRoles.call(this)
  this.log.trace('roles%d', this.roles.length)
}

export default afterAppBoot
