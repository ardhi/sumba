const doboBeforeRecordCreate = {
  level: 1000,
  handler: async function (model, body, options = {}) {
    const { get } = this.app.bajo.lib._
    const { hasColumn } = this

    if (options.noAutoFilter) return
    const item = { siteId: 'site.id', userId: 'user.id' }
    for (const i in item) {
      const rec = get(options.req, item[i])
      if (rec && await hasColumn(i, model)) body[i] = rec
    }
  }
}

export default doboBeforeRecordCreate
