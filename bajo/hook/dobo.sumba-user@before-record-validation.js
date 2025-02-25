import passwordRule from '../../lib/password-rule.js'

async function doboSumbaUserBeforeRecordValidation (body, options = {}) {
  const { set } = this.app.bajo.lib._
  const password = await passwordRule.call(this, options.req)
  const rule = { password }
  set(options, 'validation.params.rule', rule)
}

export default doboSumbaUserBeforeRecordValidation
