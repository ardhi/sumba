const doboBeforeRecordCreate = {
  level: 1000,
  handler: async function (model, body, options = {}) {
    const { get } = this.lib._
    const { getField } = this.app.dobo
    const { req } = options

    if (options.noAutoFilter || !req) return
    const item = { siteId: 'site.id', userId: 'user.id' }
    for (const i in item) {
      const rec = get(req, item[i])
      const field = getField(i, model)
      if (rec && field) body[i] = field.type === 'string' ? (rec + '') : rec
    }
  }
}

export default doboBeforeRecordCreate
