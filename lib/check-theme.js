async function checkTheme (req, reply) {
  const { get } = this.app.lib._
  const mpa = this.app.waibuMpa

  if (!req.site) return
  const siteTheme = get(req, 'site.setting.waibuMpa.theme')
  req.theme = get(mpa, 'config.theme.set', siteTheme)
  req.theme = req.theme ?? 'default'
}

export default checkTheme
