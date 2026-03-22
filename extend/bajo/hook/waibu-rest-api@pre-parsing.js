import { checkUserId, checkTeam } from '../../../lib/util.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    await checkUserId.call(this, req, reply, 'waibuRestApi')
    await checkTeam.call(this, req, reply, 'waibuRestApi')
  }
}

export default preParsing
