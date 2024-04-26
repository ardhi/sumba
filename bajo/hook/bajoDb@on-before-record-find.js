export async function handler (coll, filter, options) {
  const { isSet } = this.bajo.helper
  const { isEmpty, cloneDeep, get, set } = this.bajo.helper._
  const { hasColumn } = this.sumba.helper
  if (options.noAutoFilter) return
  const item = { siteId: 'site.id', userId: 'user.id' }
  for (const i in item) {
    const rec = get(options.req, item[i])
    if (isSet(rec) && await hasColumn(i, coll)) {
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

const bajoDbOnBeforeRecordFind = {
  level: 1000,
  handler
}

export default bajoDbOnBeforeRecordFind
