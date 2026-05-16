import { checker } from './dobo@before-driver-get-record.js'

const doboBeforeDriverUpdateRecord = {
  level: 1000,
  handler: async function (model, id, body, options = {}) {
    await checker.call(this, model, id, options)
  }
}

export default doboBeforeDriverUpdateRecord
