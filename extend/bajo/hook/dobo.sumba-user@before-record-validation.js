async function beforeRecordValidation (body, options = {}) {
  const { set } = this.app.lib._
  const password = await this.passwordRule(options.req)
  const rule = { password }
  set(options, 'validation.params.rule', rule)
}

export default beforeRecordValidation
