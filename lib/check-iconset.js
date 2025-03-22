async function checkIconset (req, reply) {
  const { get } = this.lib._

  if (!req.site) return
  const globalIconset = get(this.app, 'waibuMpa.config.iconset.default')
  req.iconset = get(req, 'site.setting.waibuMpa.iconset', globalIconset)
  // if (get(req, 'site.setting.allowUserIconset')) req.iconset = get(req, 'user.setting.iconset', req.iconset)
}

export default checkIconset
