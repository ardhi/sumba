import checkUserId from '../../lib/check-user-id.js'
import checkTeam from '../../lib/check-team.js'

const onRequest = {
  level: 10,
  handler: async function (req, reply) {
    await checkUserId.call(this, req, reply, 'waibuRestApi')
    await checkTeam.call(this, req, reply, 'waibuRestApi')
  }
}

export default onRequest
