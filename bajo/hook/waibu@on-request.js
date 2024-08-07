import checkSiteId from '../../lib/check-site-id.js'

const onRequest = {
  level: 10,
  handler: async function (ctx, req, reply) {
    await checkSiteId.call(this, req, reply)
  }
}

export default onRequest
