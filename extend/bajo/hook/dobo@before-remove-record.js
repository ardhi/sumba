import { checker } from './dobo@before-get-record.js'

const doboBeforeRemoveRecord = {
  level: 1000,
  handler: async function (id, options = {}) {
    await checker.call(this, id, options.req)
  }
}

export default doboBeforeRemoveRecord
