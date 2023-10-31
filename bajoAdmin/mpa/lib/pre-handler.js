async function preHandler (ctx, req, reply) {
  const { importModule, getConfig } = this.bajo.helper
  const cfg = getConfig('bajoAdmin', { full: true })
  const buildCollMenu = await importModule(`${cfg.dir.pkg}/lib//build-coll-menu.js`)
  const buildPagesMenu = await importModule(`${cfg.dir.pkg}/lib//build-pages-menu.js`)
  req.menu = req.menu ?? {}
  req.menu.coll = await buildCollMenu.call(this)
  req.menu.pages = await buildPagesMenu.call(this)
}

export default preHandler
