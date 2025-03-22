const doboBeforeRecordCreate = {
  level: 1000,
  handler: async function (model, body, options = {}) {
    const { get } = this.lib._
    const { hasColumn } = this
    const { req } = options

    if (options.noAutoFilter || !req) return
    const item = { siteId: 'site.id', userId: 'user.id' }
    for (const i in item) {
      const rec = get(req, item[i])
      if (rec && await hasColumn(i, model)) body[i] = rec
    }
  }
}

export default doboBeforeRecordCreate
