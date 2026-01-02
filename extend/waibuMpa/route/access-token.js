const apiToken = {
  method: 'POST',
  handler: async function (req, reply) {
    if (!req.user) return ''
    const rec = await this.app.dobo.getModel('SumbaUser').getRecord(req.user.id, { forceNoHidden: true, noCache: true })
    return (await this.createJwtFromUserRecord(rec)).token
  }
}

export default apiToken
