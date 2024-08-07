export async function handler (model, filter, options) {
  const { isSet } = this.app.bajo
  const { isEmpty, cloneDeep, get, set } = this.app.bajo.lib._
  const { hasColumn } = this

  if (options.noAutoFilter) return
  const item = { siteId: 'site.id', userId: 'user.id' }
  for (const i in item) {
    const rec = get(options.req, item[i])
    if (isSet(rec) && await hasColumn(i, model)) {
      filter.query = filter.query ?? {}
      const old = cloneDeep(filter.query.$or)
      if (old) {
        filter.query = { $and: [old] }
        filter.query.$and.push(set({}, i, rec))
      } else filter.query[i] = rec
      if (isEmpty(filter.query)) filter.query = undefined
    }
  }
}

const doboOnBeforeRecordFind = {
  level: 1000,
  handler
}

export default doboOnBeforeRecordFind
