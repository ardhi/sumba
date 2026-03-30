import { rebuildFilter } from './dobo@before-find-record.js'

export async function checker (modelName, id, options = {}) {
  const { req } = options

  const model = this.app.dobo.getModel(modelName)
  if (options.noAutoFilter || !req) return
  const filter = {}
  await rebuildFilter.call(this, modelName, filter, req)
  if (filter.query.$and) filter.query.$and.push({ id })
  else filter.query.id = id
  const row = await model.findOneRecord(filter, { count: false })
  if (!row) throw this.app.dobo.error('recordNotFound%s%s', id, this.name, { statusCode: 404 })
}

const doboBeforeGetRecord = {
  level: 1000,
  handler: async function (modelName, id, options) {
    await checker.call(this, modelName, id, options)
  }
}

export default doboBeforeGetRecord
