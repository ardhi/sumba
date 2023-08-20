import { checker } from './bajoDb@on-before-record-get.js'

const bajoDbOnBeforeRecordUpdate = {
  level: 1000,
  handler: async function (repo, id, body, options) {
    await checker.call(this, repo, id, options.req)
  }
}

export default bajoDbOnBeforeRecordUpdate
