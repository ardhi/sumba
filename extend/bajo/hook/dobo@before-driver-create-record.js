const doboBeforeDriverCreateRecord = {
  level: 1000,
  handler: async function (model, body, options = {}) {
    const { get } = this.app.lib._
    const { isSet } = this.app.lib.aneka
    const { req } = options
    if (options.noAutoFilter || !req || get(req, 'routeOptions.config.xSite')) return
    const item = { siteId: 'site.id', userId: 'user.id' }
    for (const i in item) {
      const rec = get(req, item[i])
      const field = model.getProperty(i)
      if (rec && field && !isSet(body[i])) body[i] = field.type === 'string' ? (rec + '') : rec
    }
  }
}

export default doboBeforeDriverCreateRecord
