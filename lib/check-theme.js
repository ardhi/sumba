async function checkTheme (req, reply) {
  const { get } = this.lib._
  const mpa = this.app.waibuMpa

  if (!req.site) return
  if (mpa.themes.length === 1) req.theme = mpa.themes[0].name
  else {
    const siteTheme = get(req, 'site.setting.waibuMpa.theme')
    req.theme = get(mpa, 'config.theme.set', siteTheme)
    req.theme = req.theme ?? mpa.themes[0].name
  }
}

export default checkTheme
