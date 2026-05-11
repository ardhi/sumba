import { checkUserId, checkTeam, checkInterSite } from '../../../lib/util.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    if (!await checkUserId.call(this, req, reply, 'waibuStatic')) return
    if (!await checkTeam.call(this, req, reply, 'waibuStatic')) return
    await checkInterSite.call(this, req, reply)
  }
}

export default preParsing
