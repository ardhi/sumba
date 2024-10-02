import preHandler from '../../lib/pre-handler.js'

const userman = {
  title: 'User Manager',
  preHandler,
  handler: async function (req, reply, ctx) {
    const { importModule, getConfig, readConfig } = this.app.bajo
    const { model, tpl } = await readConfig('./def.json')
    const cfg = getConfig('bajoAdmin', { full: true })
    const detailHandler = await importModule(`${cfg.dir.pkg}/lib/crud/detail-handler.js`)
    return await detailHandler.call(this, { req, reply, ctx, model, tpl })
  }
}

export default userman
