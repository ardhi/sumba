async function checkIconset (req, reply) {
  const { get } = this.app.lib._
  const mpa = this.app.waibuMpa

  if (!req.site) return
  const siteIconset = get(req, 'site.setting.waibuMpa.iconset')
  req.iconset = get(mpa, 'config.iconset.set', siteIconset)
  req.iconset = req.iconset ?? 'default'
}

export default checkIconset
