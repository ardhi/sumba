const get = {
  method: ['GET'],
  url: '/your-stuff/download/get/*',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const handler = await importModule('waibu:/lib/handle-download.js')
    const file = `${this.downloadDir}/${req.params['*']}`
    return await handler.call(this, file, req, reply)
  }
}

export default get
