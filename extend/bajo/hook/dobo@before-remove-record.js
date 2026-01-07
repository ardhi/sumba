import { checker } from './dobo@before-get-record.js'

const doboBeforeRemoveRecord = {
  level: 1000,
  handler: async function (modelName, id, options = {}) {
    await checker.call(this, modelName, id, options.req)
  }
}

export default doboBeforeRemoveRecord
