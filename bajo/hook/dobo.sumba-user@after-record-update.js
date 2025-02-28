async function afterRecordUpdate (id, body, options = {}, rec) {
  if (!(this.app.masohi && this.app.masohiMail)) return

  const { data, oldData } = rec
  const to = `${data.firstName} ${data.lastName} <${data.email}>`
  let subject

  const send = async () => {
    try {
      await this.app.masohi.send({ to, subject, message: data, options })
    } catch (err) {
    }
  }
  if (oldData.status === 'UNVERIFIED' && data.status === 'ACTIVE') {
    subject = options.req.t('userActivation')
    options.tpl = 'sumba.template:/_mail/user-activation-success.html'
    await send()
  } else if (oldData.token !== data.token) {
    subject = options.req.t('resetApiKey')
    options.tpl = 'sumba.template:/_mail/mystuff-reset-api-key.html'
    await send()
  } else if (body.password) {
    subject = options.req.t('changePassword')
    options.tpl = 'sumba.template:/_mail/mystuff-change-password.html'
    await send()
  }
}

export default afterRecordUpdate
