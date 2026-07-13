const get = {
  method: ['GET'],
  url: '/your-stuff/download/get/*',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const { download } = await importModule('waibu:/lib/helper.js', { asDefaultImport: false })
    const file = `${this.downloadDir}/${req.params['*']}`
    return await download.call(this, file, req, reply)
  }
}

export default get
