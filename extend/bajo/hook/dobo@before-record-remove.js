import { checker } from './dobo@before-record-get.js'

const doboBeforeRecordRemove = {
  level: 1000,
  handler: async function (model, id, options = {}) {
    await checker.call(this, model, id, options.req)
  }
}

export default doboBeforeRecordRemove
