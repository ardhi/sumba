import { rebuildFilter } from './dobo@before-find-record.js'

export async function checker (id, options = {}) {
  const { req } = options

  if (options.noAutoFilter || !req) return
  const filter = await rebuildFilter.call(this, {}, req)
  if (filter.query.$and) filter.query.$and.push({ id })
  else filter.query.id = id
  filter.limit = 1
  const rows = await this.findRecord(filter, { noCount: true })
  if (rows.length === 0) throw this.error('recordNotFound%s%s', id, this.name, { statusCode: 404 })
}

const doboBeforeGetRecord = {
  level: 1000,
  handler: async function (id, options) {
    await checker.call(this, id, options)
  }
}

export default doboBeforeGetRecord
