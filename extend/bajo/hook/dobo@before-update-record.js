import { checker } from './dobo@before-get-record.js'

const doboBeforeUpdateRecord = {
  level: 1000,
  handler: async function (modelName, id, body, options = {}) {
    await checker.call(this, modelName, id, options)
  }
}

export default doboBeforeUpdateRecord
