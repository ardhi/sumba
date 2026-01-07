import passwordRule from '../../../lib/password-rule.js'

async function beforeRecordValidation (body, options = {}) {
  const { set } = this.app.lib._
  const password = await passwordRule.call(this, options.req)
  const rule = { password }
  set(options, 'validation.params.rule', rule)
}

export default beforeRecordValidation
