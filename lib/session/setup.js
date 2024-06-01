import Store from './store.js'

async function session (ctx) {
  const { importPkg } = this.bajo.helper
  const { omit } = this.bajo.helper._
  const [fcookie, fsession, fflash] = await importPkg('bajoWeb:@fastify/cookie',
    'bajoWeb:@fastify/session', 'bajoWeb:@fastify/flash')
  const { getConfig } = this.bajo.helper
  const cfg = getConfig('sumba', { clone: true })
  this.sumba.sessionStore = this.sumba.sessionStore ?? new Store({ scope: this })
  const setting = cfg.auth.common.session
  setting.store = this.sumba.sessionStore
  ctx.register(fcookie)
  ctx.register(fsession, omit(setting, []))
  ctx.register(fflash)
}

export default session
