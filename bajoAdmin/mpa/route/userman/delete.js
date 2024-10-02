const userman = {
  method: 'POST',
  handler: async function (req, reply, ctx) {
    const { importModule, getConfig, readConfig } = this.app.bajo
    const { model, tpl } = await readConfig('./def.json')
    const cfg = getConfig('bajoAdmin', { full: true })
    const deleteHandler = await importModule(`${cfg.dir.pkg}/lib/crud/delete-handler.js`)
    return await deleteHandler.call(this, { req, reply, ctx, model, tpl })
  }
}

export default userman
