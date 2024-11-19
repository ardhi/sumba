async function checkTheme (req, reply) {
  const { get } = this.app.bajo.lib._

  if (!req.site) return
  const globalTheme = get(this.app, 'waibuMpa.config.theme.default')
  req.theme = get(req, 'site.setting.waibuMpa.theme', globalTheme)
  // if (get(req, 'site.setting.waibuMpa.allowUserTheme')) req.theme = get(req, 'user.setting.theme', req.theme)
}

export default checkTheme
