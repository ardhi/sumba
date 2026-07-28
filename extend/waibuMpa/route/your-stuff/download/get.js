const get = {
  method: ['GET'],
  url: '/your-stuff/download/get/:id',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const { getModel } = this.app.dobo
    const { fs } = this.app.lib
    const { download } = await importModule('waibu:/lib/helper.js', { asDefaultImport: false })
    const query = { id: req.params.id, siteId: req.site.id, userId: req.user.id, status: 'COMPLETE' }
    const rec = await getModel('SumbaDownload').findOneRecord({ query }, { noMagic: true })
    if (!rec || !fs.existsSync(rec.jobQueue.result.file)) throw this.error('fileDownloadNA', { forceShowMessage: true })
    return await download.call(this, rec.jobQueue.result.file, req, reply, rec.file)
  }
}

export default get
