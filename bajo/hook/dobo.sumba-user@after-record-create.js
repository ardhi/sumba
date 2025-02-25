async function afterRecordCreate (body, options = {}, rec) {
  if (!(this.app.masohi && this.app.masohiMail)) return
  options.tpl = 'sumba.template:/_mail/user-signup-success.html'
  const { data } = rec
  const to = `${data.firstName} ${data.lastName} <${data.email}>`
  const subject = options.req.t('newUserSignup')
  try {
    await this.app.masohi.send({ to, subject, message: data, options })
  } catch (err) {}
}

export default afterRecordCreate
