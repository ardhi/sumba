import { checkUserId, checkTeam, checkXSite } from '../../../lib/util.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    const secure = await checkUserId.call(this, req, reply, 'waibuStatic')
    if (!secure) return
    await checkTeam.call(this, req, reply, secure)
    await checkXSite.call(this, req, reply)
  }
}

export default preParsing
