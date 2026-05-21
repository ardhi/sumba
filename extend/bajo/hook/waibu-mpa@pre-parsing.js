import { checkUserId, checkTeam, checkTheme, checkIconset, checkXSite } from '../../../lib/util.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    await checkTheme.call(this, req, reply)
    await checkIconset.call(this, req, reply)
    const secure = await checkUserId.call(this, req, reply, 'waibuMpa')
    if (!secure) return
    await checkTeam.call(this, req, reply, secure)
    await checkXSite.call(this, req, reply)
  }
}

export default preParsing
