export async function getSetting (type, source) {
  const { importPkg, getConfig, defaultsDeep } = this.bajo.helper
  const { get } = await importPkg('lodash-es')
  const cfg = getConfig('sumba')
  const setting = defaultsDeep(get(cfg, `auth.${source}.${type}`, {}), get(cfg, `auth.common.${type}`, {}))
  if (type === 'basic') setting.type = 'Basic'
  return setting
}

export async function getToken (type, req, source) {
  const { importPkg } = this.bajo.helper
  const { isEmpty } = await importPkg('lodash-es')
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
  const { error } = this.bajo.helper
  const { isMd5, hash } = this.bajoExtra.helper
  const { getUser } = this.sumba.helper
  const { recordFind } = this.bajoDb.helper
  let token = await getToken.call(this, 'apiKey', req, source)
  if (!isMd5(token)) return false
  token = await hash(token)
  const query = { token }
  const rows = await recordFind('SumbaUser', { query }, { req, noHook: true })
  if (rows.length === 0) throw error('Invalid api key provided', { statusCode: 401 })
  if (rows[0].status !== 'ACTIVE') throw error('User is inactive or temporary disabled', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
  req.user = await getUser(rows[0])
  return true
}

export default verifyApiKey
