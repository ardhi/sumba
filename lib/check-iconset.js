async function checkIconset (req, reply) {
  const { get } = this.app.bajo.lib._

  if (!req.site) return
  const globalIconset = get(this.app, 'waibuMpa.config.iconset.default', false)
  if (!globalIconset) {
    req.iconset = false
    return
  }
  req.iconset = get(req, 'site.setting.iconset', globalIconset)
  if (get(req, 'site.setting.allowUserIconset')) req.iconset = get(req, 'user.setting.iconset', req.iconset)
}

export default checkIconset
