import { checker } from './dobo@before-driver-get-record.js'

const doboBeforeDriverRemoveRecord = {
  level: 1000,
  handler: async function (model, id, options = {}) {
    await checker.call(this, model, id, options.req)
  }
}

export default doboBeforeDriverRemoveRecord
