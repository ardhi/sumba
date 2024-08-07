import { checker } from './dobo@on-before-record-get.js'

const doboOnBeforeRecordUpdate = {
  level: 1000,
  handler: async function (model, id, body, options) {
    await checker.call(this, model, id, options)
  }
}

export default doboOnBeforeRecordUpdate
