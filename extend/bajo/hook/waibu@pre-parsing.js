const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    req.site = await this.getSite(req)
  }
}

export default preParsing
