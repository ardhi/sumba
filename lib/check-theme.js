async function checkTheme (req, reply) {
  const { getConfig, importPkg } = this.bajo.helper
  const { get } = this.bajo.helper._
  if (!req.site) return
  req.theme = get(req, 'site.setting.theme', getConfig('bajoWeb').theme)
  if (get(req, 'site.setting.allowUserTheme')) req.theme = get(req, 'user.setting.theme', req.theme)
}

export default checkTheme
