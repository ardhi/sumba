import { rebuildFilter } from './dobo@before-driver-find-record.js'

export async function checker (model, id, options = {}) {
  const { req } = options

  if (options.noAutoFilter || !req) return
  const filter = {}
  await rebuildFilter.call(this, model, filter, options)
  if (filter.query.$and) filter.query.$and.push({ id })
  else filter.query.id = id
  const row = await model.findOneRecord(filter, { count: false })
  if (!row) throw this.app.dobo.error('recordNotFound%s%s', id, this.name, { statusCode: 404 })
}

const doboBeforeDriverGetRecord = {
  level: 1000,
  handler: async function (model, id, options) {
    await checker.call(this, model, id, options)
  }
}

export default doboBeforeDriverGetRecord
