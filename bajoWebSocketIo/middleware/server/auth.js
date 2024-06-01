export default {
  level: 1,
  handler: async function (socket) {
    const { importPkg, getConfig } = this.bajo.helper
    const { merge } = this.bajo.helper._
    const { recordGet } = this.bajoDb.helper
    const cfg = getConfig('sumba')
    const fcookie = await importPkg('bajoWeb:@fastify/cookie')
    if (socket.handshake) {
      const cookie = fcookie.parse(socket.request.headers.cookie) ?? {}
      const key = cfg.auth.common.session.cookieName
      const sessionId = (cookie[key] ?? '').split('.')[0]
      const resp = await recordGet('SumbaSession', sessionId, { noHook: true, thrownNotFound: false })
      if (resp) {
        const session = JSON.parse(resp.session) ?? {}
        socket.session = merge({}, session.user, { sessionId, authMethod: 'cookie' })
      }
    }
  }
}
