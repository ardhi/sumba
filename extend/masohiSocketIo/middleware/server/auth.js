const auth = {
  level: 5,
  handler: async function (socket) {
    const { camelCase } = this.app.lib._
    const { req } = socket
    const { session } = req
    const site = await this.getSite(session.siteId)
    socket.join(camelCase(`site ${site.alias}`))
    let user
    if (session.userId) {
      user = await this.getUser(session.userId)
      if (user) {
        socket.join(camelCase(`user ${user.username}`))
        await this.mergeTeam(user, site)
        for (const team of user.teams) {
          socket.join(camelCase(`team ${team.alias}`))
        }
      }
    }
    socket.req.site = site
    socket.req.user = user
  }
}

export default auth
