async function checkIconset (req, reply) {
  const { get } = this.lib._
  const mpa = this.app.waibuMpa

  if (!req.site) return
  if (mpa.iconsets.length === 1) req.iconset = mpa.iconsets[0].name
  else {
    const siteIconset = get(req, 'site.setting.waibuMpa.iconset')
    req.iconset = get(mpa, 'config.iconset.default', siteIconset)
  }
}

export default checkIconset
