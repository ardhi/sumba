import { rebuildFilter } from './dobo@before-find-record.js'

export async function checker (modelName, id, options = {}) {
  const { req } = options

  const model = this.app.dobo.getModel(modelName)
  if (options.noAutoFilter || !req) return
  const filter = await rebuildFilter.call(this, modelName, {}, req)
  if (filter.query.$and) filter.query.$and.push({ id })
  else filter.query.id = id
  filter.limit = 1
  const rows = await model.findRecord(filter, { count: false })
  if (rows.length === 0) throw this.app.dobo.error('recordNotFound%s%s', id, this.name, { statusCode: 404 })
}

const doboBeforeGetRecord = {
  level: 1000,
  handler: async function (modelName, id, options) {
    await checker.call(this, modelName, id, options)
  }
}

export default doboBeforeGetRecord
