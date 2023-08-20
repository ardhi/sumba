import checkSiteId from '../../lib/check-site-id.js'
import checkUserId from '../../lib/check-user-id.js'

const onRequest = {
  level: 10,
  handler: async function (ctx, req, reply) {
    await checkSiteId.call(this, ctx, req, reply)
    await checkUserId.call(this, ctx, req, reply)
  }
}

export default onRequest
