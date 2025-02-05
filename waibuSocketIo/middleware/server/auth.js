export default {
  level: 1,
  handler: async function (socket) {
    const { merge } = this.app.bajo.lib._
    const { recordGet } = this.app.dobo
    const { getSessionId } = this.app.waibuMpa

    if (socket.handshake) {
      const sessionId = await getSessionId(socket.request.headers.cookie)
      const resp = await recordGet('WbmpaSession', sessionId, { noHook: true, thrownNotFound: false })
      if (resp) {
        const session = JSON.parse(resp.session) ?? {}
        socket.session = merge({}, session.user, { sessionId, authMethod: 'cookie' })
      }
    }
  }
}
