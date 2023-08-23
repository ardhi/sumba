import checkUserId from '../../lib/check-user-id.js'

const onRequest = {
  level: 10,
  handler: async function (ctx, req, reply) {
    await checkUserId.call(this, req, reply, 'bajoWebStatic')
  }
}

export default onRequest
