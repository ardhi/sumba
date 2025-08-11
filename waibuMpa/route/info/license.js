async function license (req, reply) {
  if (!this.config.license) throw this.error('_notFound')
  const { fs } = this.lib
  const base = `${this.app.main.dir.pkg}/../LICENSE`
  let tpl = `${base}.${req.lang}.md`
  if (!fs.existsSync(tpl)) tpl = `${base}.md`
  return await reply.view(tpl, { page: { title: req.t('license') }, license: this.config.license })
}

export default license
