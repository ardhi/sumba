const download = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const crudSkel = await importModule('waibuAdmin:/lib/crud-skel.js')
    const layoutTpl = 'main.layout:/with-addons.html'
    const tpl = 'waibuAdmin.template:/crud/list-notitle.html'
    const options = { forceShowId: false, hidden: ['id'] }
    return await crudSkel.call(this, 'SumbaDownload', req, reply, { tpl, layoutTpl, title: req.t('downloadList'), options })
  }
}

export default download
