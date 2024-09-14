import { getToken, getSetting } from './api-key.js'

async function verifyJwt (req, reply, source) {
  const { importPkg } = this.app.bajo
  const { recordGet } = this.app.dobo
  const { getUser } = this
  const { isEmpty } = this.app.bajo.lib._

  const fastJwt = await importPkg('bajoExtra:fast-jwt')
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
    const rec = await recordGet('SumbaUser', id, { req, noHook: true })
    if (!rec) throw this.error('Invalid token or token is expired', { statusCode: 401 })
    if (rec.status !== 'ACTIVE') throw this.error('User is inactive or temporarily disabled', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
    req.user = await getUser(rec)
    return true
  } catch (err) {
    return false
  }
}

export default verifyJwt
