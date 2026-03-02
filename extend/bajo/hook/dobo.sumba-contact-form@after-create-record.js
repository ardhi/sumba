async function afterCreateRecord (body, rec, options = {}) {
  const { data } = rec
  const { req } = options
  const { get } = this.app.lib._
  const t = get(req, 't', this.t)
  const to = `${data.firstName} ${data.lastName} <${data.email}>`
  let bcc
  if (req.site) bcc = req.site.email
  const subject = t('contactForm')
  const payload = { to, bcc, subject, data }
  await this.sendMail(
    'sumba.template:/_mail/help-contact-form.html',
    { payload, options, source: this.ns }
  )
}

export default afterCreateRecord
