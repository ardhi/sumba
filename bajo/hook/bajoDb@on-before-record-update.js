import { checker } from './bajoDb@on-before-record-get.js'

const bajoDbOnBeforeRecordUpdate = {
  level: 1000,
  handler: async function (coll, id, body, options) {
    await checker.call(this, coll, id, options.req)
  }
}

export default bajoDbOnBeforeRecordUpdate
