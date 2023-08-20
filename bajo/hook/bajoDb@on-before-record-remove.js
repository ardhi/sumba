import { checker } from './bajoDb@on-before-record-get.js'

const bajoDbOnBeforeRecordRemove = {
  level: 1000,
  handler: async function (repo, id, options) {
    await checker.call(this, repo, id, options.req)
  }
}

export default bajoDbOnBeforeRecordRemove
