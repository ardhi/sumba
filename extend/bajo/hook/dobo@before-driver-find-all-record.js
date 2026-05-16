import { rebuildFilter } from './dobo@before-driver-find-record.js'

const doboBeforeDriverFindAllRecord = {
  level: 1000,
  handler: async function (model, filter, options) {
    const { req } = options
    const { isEmpty } = this.app.lib._
    if (options.noAutoFilter || !req || isEmpty(req.site)) return
    await rebuildFilter.call(this, model, filter, options)
  }
}

export default doboBeforeDriverFindAllRecord
