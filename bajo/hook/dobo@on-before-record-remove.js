import { checker } from './dobo@on-before-record-get.js'

const doboOnBeforeRecordRemove = {
  level: 1000,
  handler: async function (model, id, options) {
    await checker.call(this, model, id, options.req)
  }
}

export default doboOnBeforeRecordRemove
