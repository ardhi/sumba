async function checkDarkMode (req, reply) {
  const { getConfig, isSet } = this.bajo.helper
  if (!req.session) return
  const cfg = getConfig('bajoWebMpa')
  if (!cfg.darkMode.qsKey) {
    req.session.dark = cfg.darkMode.preset
    return
  }
  if (isSet(req.query[cfg.darkMode.qsKey])) req.session.dark = req.dark
  else req.dark = req.session.dark ?? cfg.darkMode.preset
}

export default checkDarkMode
