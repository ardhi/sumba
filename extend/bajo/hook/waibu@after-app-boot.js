import { collectRoutes, collectTeam } from '../../../lib/collect.js'

async function afterAppBoot () {
  const { runHook } = this.app.bajo
  await runHook(`${this.ns}:beforeBoot`)
  this.log.trace('collectingRouteGuards')
  await collectRoutes.call(this, 'secure')
  await runHook(`${this.ns}:afterCollectSecureRoutes`, this.secureRoutes, this.secureNegRoutes)
  this.log.trace('secureRoutes%d', this.secureRoutes.length)
  this.log.trace('secureNegRoutes%d', this.secureNegRoutes.length)
  await collectRoutes.call(this, 'anonymous')
  await runHook(`${this.ns}:afterCollectAnonymousRoutes`, this.anonymousRoutes, this.anonymousNegRoutes)
  this.log.trace('anonRoutes%d', this.anonymousRoutes.length)
  this.log.trace('anonNegRoutes%d', this.anonymousNegRoutes.length)
  this.log.trace('collectingTeamGuards')
  await collectTeam.call(this)
  await runHook(`${this.ns}:afterCollectTeamRoutes`, this.teamRoutes, this.teamNegRoutes)
  this.log.trace('teamRoutes%d', this.teamRoutes.length)
  this.log.trace('teamNegRoutes%d', this.teamNegRoutes.length)
  await runHook(`${this.ns}:afterBoot`)
}

export default afterAppBoot
