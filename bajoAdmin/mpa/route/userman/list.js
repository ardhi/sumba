import preHandler from '../../lib/pre-handler.js'

const userman = {
  title: 'User Manager',
  preHandler,
  config: { adminMenu: true },
  handler: async function (req, reply, ctx) {
    const { importModule, getConfig, readConfig } = this.app.bajo
    const { model, tpl } = await readConfig('./def.json')
    const cfg = getConfig('bajoAdmin', { full: true })
    const listHandler = await importModule(`${cfg.dir.pkg}/lib/crud/list-handler.js`)
    return await listHandler.call(this, { req, reply, ctx, model, tpl })
  }
}

export default userman
