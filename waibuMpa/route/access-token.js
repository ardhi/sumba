const apiToken = {
  method: 'POST',
  handler: async function (req, reply) {
    const { recordGet } = this.app.dobo
    if (!req.user) return ''
    const rec = await recordGet('SumbaUser', req.user.id, { forceNoHidden: true, noCache: true })
    return (await this.createJwtFromUserRecord(rec)).token
  }
}

export default apiToken
