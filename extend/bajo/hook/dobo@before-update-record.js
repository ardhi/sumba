import { checker } from './dobo@before-get-record.js'

const doboBeforeUpdateRecord = {
  level: 1000,
  handler: async function (id, body, options = {}) {
    await checker.call(this, id, options)
  }
}

export default doboBeforeUpdateRecord
