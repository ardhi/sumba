const onRequest = {
  level: 10,
  handler: async function (req, reply) {
    const hostname = req.hostname.split(':')[0]
    req.site = await this.getSite(hostname)
  }
}

export default onRequest
