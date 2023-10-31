import preHandler from '../../lib/pre-handler.js'

const userman = {
  title: 'User Manager',
  preHandler,
  handler: async function (ctx, req, reply) {
    const { importModule, getConfig, readConfig, currentLoc } = this.bajo.helper
    const { coll, tpl } = await readConfig(currentLoc(import.meta).dir + '/def.json')
    const cfg = getConfig('bajoAdmin', { full: true })
    const detailHandler = await importModule(`${cfg.dir.pkg}/lib/crud/detail-handler.js`)
    return await detailHandler.call(this, { ctx, req, reply, coll, tpl })
  }
}

export default userman
