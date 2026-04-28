export async function clearCache (id, result) {
  if (!this.app.bajoCache) return
  const { clear } = this.app.bajoCache ?? {}
  const { get } = this.app.lib._
  const token = get(result, 'data.token', get(result, 'oldData.token', ''))
  await clear({ key: `dobo|SumbaUser|getUserById|${id}` })
  await clear({ key: `dobo|SumbaUser|getUserByToken|${token}` })
}

async function afterUpdateRecord (id, body, rec, options = {}) {
  const { data, oldData } = rec
  const { req } = options
  const { get } = this.app.lib._
  const t = get(req, 't', this.t)
  const to = `${data.firstName} ${data.lastName} <${data.email}>`
  const source = this.ns

  await clearCache.call(this, id, rec)

  let subject
  const payload = { to, subject, data }

  if (oldData.status === 'UNVERIFIED' && data.status === 'ACTIVE') {
    payload.subject = t('userActivation')
    await this.sendMail(
      'sumba.template:/_mail/user-activation-success.html',
      { payload, options, source }
    )
  } else if (oldData.token !== data.token) {
    payload.subject = t('resetApiKey')
    await this.sendMail(
      'sumba.template:/_mail/mystuff-reset-api-key.html',
      { payload, options, source }
    )
  } else if (body.password) {
    payload.subject = t('changePassword')
    await this.sendMail(
      'sumba.template:/_mail/mystuff-change-password.html',
      { payload, options, source }
    )
  }
}

export default afterUpdateRecord
