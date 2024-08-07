export async function getSetting (type, source) {
  const { defaultsDeep } = this.app.bajo
  const { get } = this.app.bajo.lib._

  const setting = defaultsDeep(get(this.config, `auth.${source}.${type}`, {}), get(this.config, `auth.common.${type}`, {}))
  if (type === 'basic') setting.type = 'Basic'
  return setting
}

export async function getToken (type, req, source) {
  const { isEmpty } = this.app.bajo.lib._

  const setting = await getSetting.call(this, type, source)
  let token = req.headers[setting.headerKey.toLowerCase()]
  if (!['basic'].includes(type) && isEmpty(token)) token = req.query[setting.qsKey]
  if (isEmpty(token)) {
    const parts = (req.headers.authorization || '').split(' ')
    if (parts[0] === setting.type) token = parts[1]
  }
  if (isEmpty(token)) return false
  return token
}

async function verifyApiKey (ctx, req, reply, source) {
  const { isMd5, hash } = this.app.bajoExtra
  const { getUser } = this
  const { recordFind } = this.app.dobo

  let token = await getToken.call(this, 'apiKey', req, source)
  if (!isMd5(token)) return false
  token = await hash(token)
  const query = { token }
  const rows = await recordFind('SumbaUser', { query }, { req, noHook: true })
  if (rows.length === 0) throw this.error('Invalid api key provided', { statusCode: 401 })
  if (rows[0].status !== 'ACTIVE') throw this.error('User is inactive or temporarily disabled', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
  req.user = await getUser(rows[0])
  return true
}

export default verifyApiKey
