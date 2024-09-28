import collectRoutes from '../../lib/collect-routes.js'

async function afterAppBoot () {
  this.log.trace('Collecting route guards:')
  await collectRoutes.call(this, 'secure')
  await collectRoutes.call(this, 'anonymous')
  this.log.trace('- Secure routes: %d', this.secureRoutes.length)
  this.log.trace('- Secure, inverted routes: %d', this.secureInvRoutes.length)
  this.log.trace('- Anonymous routes: %d', this.anonymousRoutes.length)
  this.log.trace('- Anonymous, inverted routes: %d', this.anonymousInvRoutes.length)
}

export default afterAppBoot
