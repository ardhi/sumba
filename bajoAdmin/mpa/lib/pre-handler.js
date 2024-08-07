async function preHandler (ctx, req, reply) {
  const { importModule, getConfig } = this.app.bajo
  const cfg = getConfig('bajoAdmin', { full: true })
  const buildCollMenu = await importModule(`${cfg.dir.pkg}/lib//build-model-menu.js`)
  const buildPagesMenu = await importModule(`${cfg.dir.pkg}/lib//build-pages-menu.js`)
  req.menu = req.menu ?? {}
  req.menu.model = await buildCollMenu.call(this)
  req.menu.pages = buildPagesMenu.call(this)
}

export default preHandler
