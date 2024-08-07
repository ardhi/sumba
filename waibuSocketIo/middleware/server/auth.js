export default {
  level: 1,
  handler: async function (socket) {
    const { importPkg } = this.app.bajo
    const { merge } = this.app.bajo.lib._
    const { recordGet } = this.app.dobo

    const fcookie = await importPkg('waibu:@fastify/cookie')
    if (socket.handshake) {
      const cookie = fcookie.parse(socket.request.headers.cookie) ?? {}
      const key = this.config.auth.common.session.cookieName
      const sessionId = (cookie[key] ?? '').split('.')[0]
      const resp = await recordGet('WbmpaSession', sessionId, { noHook: true, thrownNotFound: false })
      if (resp) {
        const session = JSON.parse(resp.session) ?? {}
        socket.session = merge({}, session.user, { sessionId, authMethod: 'cookie' })
      }
    }
  }
}
