const apiToken = {
  method: 'POST',
  handler: async function (req, reply) {
    const { get } = this.app.lib._
    const uid = get(req, 'user.id')
    if (!uid) return ''
    const rec = await this.app.dobo.getModel('SumbaUser').getRecord(uid, { forceNoHidden: true, noCache: true })
    return (await this.createJwtFromUserRecord(rec)).token
  }
}

export default apiToken
