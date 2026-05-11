import { checkUserId, checkTeam, checkTheme, checkIconset, checkInterSite } from '../../../lib/util.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    await checkTheme.call(this, req, reply)
    await checkIconset.call(this, req, reply)
    if (!await checkUserId.call(this, req, reply, 'waibuMpa')) return
    if (!await checkTeam.call(this, req, reply, 'waibuMpa')) return
    await checkInterSite.call(this, req, reply)
  }
}

export default preParsing
