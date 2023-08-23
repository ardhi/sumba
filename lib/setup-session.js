import { getSetting } from '../bajo/helper/verify/api-key.js'
import { setupReq, reply } from './setup-flash.js'
import SessionStore from './session-store.js'

async function setup (source) {
  const { importPkg } = this.bajo.helper
  const { omit } = await importPkg('lodash-es')
  const [fcookie, fsession] = await importPkg('bajo-web:@fastify/cookie',
    'bajo-web:@fastify/session')
  const setting = await getSetting.call(this, 'session', source)
  setting.store = this.sumba.sessionStore
  const instance = this[source].instance
  instance.register(fcookie)
  instance.register(fsession, omit(setting, ['loginPage']))
  if (source === 'bajoWebMpa') {
    const req = await setupReq.call(this)
    instance.decorateRequest('flash', req)
    instance.decorateReply('flash', reply)
  }
}

async function setupSession (source) {
  const { getConfig } = this.bajo.helper
  this.sumba.sessionStore = this.sumba.sessionStore ?? new SessionStore({ scope: this })
  const auth = getConfig('sumba').auth
  if (this[source] && this[source].instance && auth[source].methods.includes('session')) await setup.call(this, source)
}

export default setupSession
