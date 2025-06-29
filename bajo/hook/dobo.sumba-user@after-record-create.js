async function afterRecordCreate (body, options = {}, rec) {
  if (!options.req) return
  if (!this.app.waibu) return
  const { sendMail } = this.app.waibu
  const { data } = rec
  const to = `${data.firstName} ${data.lastName} <${data.email}>`
  const subject = options.req.t('newUserSignup')
  await sendMail(
    'sumba.template:/_mail/user-signup-success.html',
    { to, subject, data, options, source: this.name }
  )
}

export default afterRecordCreate
