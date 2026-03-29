import { checkUserId, checkTeam, checkinterSite } from '../../../lib/util.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    await checkUserId.call(this, req, reply, 'waibuStatic')
    await checkTeam.call(this, req, reply, 'waibuStatic')
    await checkinterSite.call(this, req, reply)
  }
}

export default preParsing
