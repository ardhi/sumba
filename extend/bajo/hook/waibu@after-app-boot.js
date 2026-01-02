import collectRoutes from '../../../lib/collect-routes.js'
import collectTeam from '../../../lib/collect-team.js'

async function afterAppBoot () {
  const { runHook } = this.app.bajo
  await runHook(`${this.ns}:beforeBoot`)
  this.log.trace('collectingRouteGuards')
  await collectRoutes.call(this, 'secure')
  this.log.trace('secureRoutes%d', this.secureRoutes.length)
  this.log.trace('secureNegRoutes%d', this.secureNegRoutes.length)
  await collectRoutes.call(this, 'anonymous')
  this.log.trace('anonRoutes%d', this.anonymousRoutes.length)
  this.log.trace('anonNegRoutes%d', this.anonymousNegRoutes.length)
  this.log.trace('collectingTeamGuards')
  await collectTeam.call(this)
  this.log.trace('teamRoutes%d', this.teamRoutes.length)
  this.log.trace('teamNegRoutes%d', this.teamNegRoutes.length)
  await runHook(`${this.ns}:afterBoot`)
}

export default afterAppBoot
