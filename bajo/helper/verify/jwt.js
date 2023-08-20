import { getToken } from './api-key.js'

async function verifyJwt (ctx, req, reply) {
  const { importPkg, error, getConfig } = this.bajo.helper
  const { recordGet } = this.bajoDb.helper
  const { get, isEmpty } = await importPkg('lodash-es')
  const fastJwt = await importPkg('bajo-extra:fast-jwt')
  const { createVerifier } = fastJwt

  const cfg = getConfig('sumba')
  const token = await getToken.call(this, 'jwt', req)
  if (isEmpty(token)) return false
  const verifier = createVerifier({
    key: get(cfg, 'auth.jwt.secret'),
    complete: true
  })
  const decoded = await verifier(token)
  const id = decoded.payload.uid
  try {
    const rec = await recordGet('SumbaUser', id, { req })
    if (!rec) throw error('Invalid token or token is expired', { statusCode: 401 })
    if (rec.status !== 'ACTIVE') throw error('User is inactive or temporary disabled', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
    req.user = rec
    return true
  } catch (err) {
    return false
  }
}

export default verifyJwt
