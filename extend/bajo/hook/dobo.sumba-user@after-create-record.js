async function afterCreateRecord (body, rec, options = {}) {
  const { data } = rec
  const { req } = options
  const { get } = this.app.lib._
  const t = get(req, 't', this.t)
  const to = `${data.firstName} ${data.lastName} <${data.email}>`
  const subject = t('newUserSignup')
  const payload = { to, subject, data }
  await this.sendMail(
    `sumba.template:/_mail/user-signup-success${data.status === 'ACTIVE' ? '-active' : ''}.html`,
    { payload, options, source: this.ns }
  )
}

export default afterCreateRecord
