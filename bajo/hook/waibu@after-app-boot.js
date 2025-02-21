import collectRoutes from '../../lib/collect-routes.js'

async function afterAppBoot () {
  this.log.trace('collectingRouteGuards')
  await collectRoutes.call(this, 'secure')
  await collectRoutes.call(this, 'anonymous')
  this.log.trace('secureRoutes%d', this.secureRoutes.length)
  this.log.trace('secureInvRoutes%d', this.secureInvRoutes.length)
  this.log.trace('anonRoutes%d', this.anonymousRoutes.length)
  this.log.trace('anonInvRoutes%d', this.anonymousInvRoutes.length)
}

export default afterAppBoot
