import checkUserId from '../../lib/check-user-id.js'

const onRequest = {
  level: 10,
  handler: async function (req, reply) {
    await checkUserId.call(this, req, reply, 'waibuStatic')
  }
}

export default onRequest
