import preParsing from '../../lib/pre-parsing.js'

const coll = 'SumbaUser'
const tpl = 'sumba:/userman/list'

const userman = {
  name: 'User Manager',
  method: ['GET', 'POST'],
  preParsing,
  config: { adminMenu: true },
  handler: async function (ctx, req, reply) {
    const { importModule, getConfig } = this.bajo.helper
    const cfg = getConfig('bajoAdmin', { full: true })
    const listHandler = await importModule(`${cfg.dir.pkg}/lib/crud/list-handler.js`)
    return await listHandler.call(this, { ctx, req, reply, coll, tpl })
  }
}

export default userman
