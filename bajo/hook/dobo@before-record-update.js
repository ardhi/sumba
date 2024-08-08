import { checker } from './dobo@before-record-get.js'

const doboBeforeRecordUpdate = {
  level: 1000,
  handler: async function (model, id, body, options) {
    await checker.call(this, model, id, options)
  }
}

export default doboBeforeRecordUpdate
