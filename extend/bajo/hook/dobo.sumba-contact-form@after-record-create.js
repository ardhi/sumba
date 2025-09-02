async function afterRecordCreate (body, options = {}, rec) {
  if (!options.req) return
  if (!this.app.waibu) return
  const { sendMail } = this.app.waibu
  const { data } = rec
  const { req } = options
  const to = `${data.firstName} ${data.lastName} <${data.email}>`
  let bcc
  if (req && req.site) bcc = req.site.email
  const subject = options.req.t('contactForm')
  await sendMail(
    'sumba.template:/_mail/help-contact-form.html',
    { to, bcc, subject, data, options, source: this.ns }
  )
}

export default afterRecordCreate
