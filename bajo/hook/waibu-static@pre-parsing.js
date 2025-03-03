import checkUserId from '../../lib/check-user-id.js'
import checkRole from '../../lib/check-role.js'

const onRequest = {
  level: 10,
  handler: async function (req, reply) {
    await checkUserId.call(this, req, reply, 'waibuStatic')
    await checkRole.call(this, req, reply, 'waibuStatic')
  }
}

export default onRequest
