import passwordRule from '../../../lib/password-rule.js'

async function doboSumbaUserBeforeRecordValidation (body, options = {}) {
  const { set } = this.lib._
  const password = await passwordRule.call(this, options.req)
  const rule = { password }
  set(options, 'validation.params.rule', rule)
}

export default doboSumbaUserBeforeRecordValidation
