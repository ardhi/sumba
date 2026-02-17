async function checkTheme (req, reply) {
  const { get, isString } = this.app.lib._
  const mpa = this.app.waibuMpa

  if (!req.site) return
  const siteTheme = get(req, 'site.setting.waibuMpa.theme')
  req.theme = siteTheme ?? get(mpa, 'config.theme.set', 'default')
  const htheme = req.headers['x-theme']
  if (isString(htheme) && mpa.getTheme(htheme)) req.theme = htheme
  req.theme = req.theme ?? 'default'
}

export default checkTheme
