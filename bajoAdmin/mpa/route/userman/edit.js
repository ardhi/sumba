import preHandler from '../../lib/pre-handler.js'

const userman = {
  title: 'User Manager',
  preHandler,
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { importModule, getConfig, readConfig, currentLoc } = this.bajo.helper
    const { coll, tpl } = await readConfig(currentLoc(import.meta).dir + '/def.json')
    const cfg = getConfig('bajoAdmin', { full: true })
    const editHandler = await importModule(`${cfg.dir.pkg}/lib/crud/edit-handler.js`)
    return await editHandler.call(this, { ctx, req, reply, coll, tpl })
  }
}

export default userman
