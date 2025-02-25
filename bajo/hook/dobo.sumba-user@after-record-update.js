async function afterRecordUpdate (id, body, options = {}, rec) {
  if (!(this.app.masohi && this.app.masohiMail)) return
  const { data, oldData } = rec
  if (!(oldData.status === 'UNVERIFIED' && data.status === 'ACTIVE')) return
  options.tpl = 'sumba.template:/_mail/user-activation-success.html'
  const to = `${data.firstName} ${data.lastName} <${data.email}>`
  const subject = options.req.t('userActivation')
  try {
    await this.app.masohi.send({ to, subject, message: data, options })
  } catch (err) {}
}

export default afterRecordUpdate
