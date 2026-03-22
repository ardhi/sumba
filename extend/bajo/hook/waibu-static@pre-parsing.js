import { checkUserId, checkTeam } from '../../../lib/util.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    await checkUserId.call(this, req, reply, 'waibuStatic')
    await checkTeam.call(this, req, reply, 'waibuStatic')
  }
}

export default preParsing
