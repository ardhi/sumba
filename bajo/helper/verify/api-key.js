export async function getToken (type, req) {
  const { importPkg, getConfig } = this.bajo.helper
  const { isEmpty, get } = await importPkg('lodash-es')
  const cfg = getConfig('sumba')

  let token = req.headers[get(cfg, `auth.${type}.headerKey`, '').toLowerCase()]
  if (isEmpty(token)) token = req.query[get(cfg, `auth.${type}.qsKey`)]
  if (isEmpty(token)) {
    const parts = (req.headers.authorization || '').split(' ')
    if (parts[0] === get(cfg, `auth.${type}.type`)) token = parts[1]
  }
  if (isEmpty(token)) return false
  return token
}

async function verifyApiKey (ctx, req, reply) {
  const { error } = this.bajo.helper
  const { isMd5, hash } = this.bajoExtra.helper
  const { recordFind } = this.bajoDb.helper

  let token = await getToken.call(this, 'apiKey', req)
  if (!isMd5(token)) return false
  token = await hash(token)
  const query = { token }
  const rows = await recordFind('SumbaUser', { query }, { req })
  if (rows.length === 0) throw error('Invalid api key provided', { statusCode: 401 })
  if (rows[0].status !== 'ACTIVE') throw error('User is inactive or temporary disabled', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
  req.user = rows[0]
  return true
}

export default verifyApiKey
