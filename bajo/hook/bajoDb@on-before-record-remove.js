import { checker } from './bajoDb@on-before-record-get.js'

const bajoDbOnBeforeRecordRemove = {
  level: 1000,
  handler: async function (coll, id, options) {
    await checker.call(this, coll, id, options.req)
  }
}

export default bajoDbOnBeforeRecordRemove
