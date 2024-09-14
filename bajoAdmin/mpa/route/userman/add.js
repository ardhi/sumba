import preHandler from '../../lib/pre-handler.js'

const userman = {
  title: 'User Manager',
  preHandler,
  method: ['GET', 'POST'],
  handler: async function (req, reply, ctx) {
    const { importModule, getConfig, readConfig, currentLoc } = this.app.bajo
    const { model, tpl } = await readConfig(currentLoc(import.meta).dir + '/def.json')
    const cfg = getConfig('bajoAdmin', { full: true })
    const addHandler = await importModule(`${cfg.dir.pkg}/lib/crud/add-handler.js`)
    return await addHandler.call(this, { req, reply, ctx, model, tpl })
  }
}

export default userman
