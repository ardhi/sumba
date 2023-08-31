async function checkLang (req, reply) {
  const { getConfig, importPkg } = this.bajo.helper
  const { get } = await importPkg('lodash-es')
  const cfg = getConfig('bajoWeb')
  if (!req.session) return
  if (req.query[cfg.qsKey.lang]) {
    req.session.lang = req.lang
    return
  }
  const supported = get(this, 'bajoI18N.config.supportedLngs', ['en'])
  if (req.session.lang && supported.includes(req.session.lang.split('-')[0])) {
    req.lang = req.session.lang
  } else req.session.lang = req.lang
}

export default checkLang
