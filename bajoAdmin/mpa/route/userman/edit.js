import preHandler from '../../lib/pre-handler.js'

const userman = {
  title: 'User Manager',
  preHandler,
  method: ['GET', 'POST'],
  handler: async function (req, reply, ctx) {
    const { importModule, getConfig, readConfig } = this.app.bajo
    const { model, tpl } = await readConfig('./def.json')
    const cfg = getConfig('bajoAdmin', { full: true })
    const editHandler = await importModule(`${cfg.dir.pkg}/lib/crud/edit-handler.js`)
    return await editHandler.call(this, { req, reply, ctx, model, tpl })
  }
}

export default userman
