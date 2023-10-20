import { getToken, getSetting } from './api-key.js'

async function verifyJwt (ctx, req, reply, source) {
  const { importPkg, error } = this.bajo.helper
  const { recordGet } = this.bajoDb.helper
  const { getUser } = this.sumba.helper
  const { isEmpty } = await importPkg('lodash-es')
  const fastJwt = await importPkg('bajo-extra:fast-jwt')
  const { createVerifier } = fastJwt
  const setting = await getSetting.call(this, 'jwt', source)
  const token = await getToken.call(this, 'jwt', req, source)
  if (isEmpty(token)) return false
  const verifier = createVerifier({
    key: setting.secret,
    complete: true
  })
  const decoded = await verifier(token)
  const id = decoded.payload.uid
  try {
    const rec = await recordGet('SumbaUser', id, { req })
    if (!rec) throw error('Invalid token or token is expired', { statusCode: 401 })
    if (rec.status !== 'ACTIVE') throw error('User is inactive or temporary disabled', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
    req.user = await getUser(rec)
    return true
  } catch (err) {
    return false
  }
}

export default verifyJwt
