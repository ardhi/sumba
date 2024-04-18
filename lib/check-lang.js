async function checkLang (req, reply) {
  const { importPkg } = this.bajo.helper
  const { get } = this.bajo.helper._
  if (!req.session) return
  if (req.lang && req.langDetector) {
    req.session.lang = req.lang
    return
  }
  const supported = get(this, 'bajoI18N.config.supportedLngs', ['en'])
  if (req.session.lang && supported.includes(req.session.lang.split('-')[0])) {
    req.lang = req.session.lang
  }
}

export default checkLang
