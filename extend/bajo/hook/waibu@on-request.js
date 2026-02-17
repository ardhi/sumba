const onRequest = {
  level: 10,
  handler: async function (req, reply) {
    const { getHostname } = this.app.waibu
    req.site = await this.getSite(getHostname(req))
  }
}

export default onRequest
