import { rebuildFilter } from './dobo@before-record-find.js'

export async function checker (model, id, options = {}) {
  const { recordFind } = this.app.dobo
  const { req } = options

  if (options.noAutoFilter || !req) return
  const filter = await rebuildFilter.call(this, model, {}, req)
  if (filter.query.$and) filter.query.$and.push({ id })
  else filter.query.id = id
  filter.limit = 1
  const rows = await recordFind(model, filter, { noCount: true })
  if (rows.length === 0) throw this.error('recordNotFound%s%s', id, model, { statusCode: 404 })
}

const doboBeforeRecordGet = {
  level: 1000,
  handler: async function (model, id, options) {
    await checker.call(this, model, id, options)
  }
}

export default doboBeforeRecordGet
