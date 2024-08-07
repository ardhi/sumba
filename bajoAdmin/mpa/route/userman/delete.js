const userman = {
  method: 'POST',
  handler: async function (ctx, req, reply) {
    const { importModule, getConfig, readConfig, currentLoc } = this.app.bajo
    const { model, tpl } = await readConfig(currentLoc(import.meta).dir + '/def.json')
    const cfg = getConfig('bajoAdmin', { full: true })
    const deleteHandler = await importModule(`${cfg.dir.pkg}/lib/crud/delete-handler.js`)
    return await deleteHandler.call(this, { ctx, req, reply, model, tpl })
  }
}

export default userman
