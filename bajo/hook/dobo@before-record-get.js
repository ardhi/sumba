export async function checker (model, id, options) {
  const { recordFind } = this.app.dobo
  const { get } = this.app.bajo.lib._
  const { hasColumn } = this

  if (options.noAutoFilter) return
  const item = { siteId: 'site.id', userId: 'user.id' }
  for (const i in item) {
    const rec = get(options.req, item[i])
    if (rec && await hasColumn(i, model)) {
      const filter = { query: { id }, limit: 1 }
      filter.query[i] = rec
      const rows = await recordFind(model, filter)
      if (rows.length === 0) throw this.error('Record \'%s@%s\' not found!', id, model, { statusCode: 404 })
    }
  }
}

const doboBeforeRecordGet = {
  level: 1000,
  handler: async function (model, id, options) {
    await checker.call(this, model, id, options)
  }
}

export default doboBeforeRecordGet
