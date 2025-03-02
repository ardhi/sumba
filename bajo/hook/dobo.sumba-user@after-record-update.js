async function afterRecordUpdate (id, body, options = {}, rec) {
  if (!options.req) return
  if (!this.app.waibu) return
  const { data, oldData } = rec
  const { sendMail } = this.app.waibu
  const to = `${data.firstName} ${data.lastName} <${data.email}>`
  let subject

  if (oldData.status === 'UNVERIFIED' && data.status === 'ACTIVE') {
    subject = options.req.t('userActivation')
    await sendMail(
      'sumba.template:/_mail/user-activation-success.html',
      { to, subject, data, options }
    )
  } else if (oldData.token !== data.token) {
    subject = options.req.t('resetApiKey')
    await sendMail(
      'sumba.template:/_mail/mystuff-reset-api-key.html',
      { to, subject, data, options }
    )
  } else if (body.password) {
    subject = options.req.t('changePassword')
    await sendMail(
      'sumba.template:/_mail/mystuff-change-password.html',
      { to, subject, data, options }
    )
  }
}

export default afterRecordUpdate
