async function checkIconset (req, reply) {
  const { get, isString } = this.app.lib._
  const mpa = this.app.waibuMpa

  if (!req.site) return
  const siteIconset = get(req, 'site.setting.waibuMpa.iconset')
  req.iconset = siteIconset ?? get(mpa, 'config.iconset.set', 'default')
  const hiconset = req.headers['x-iconset']
  if (isString(hiconset) && mpa.getIconset(hiconset)) req.iconset = hiconset
  req.iconset = req.iconset ?? 'default'
}

export default checkIconset
