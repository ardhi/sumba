import { getSetting } from './api-key.js'

async function setHeader (setting, reply) {
  const { isString } = this.bajo.helper._
  let header = setting.type
  const exts = []
  if (isString(setting.realm)) exts.push(`realm="${setting.realm}"`)
  if (setting.useUtf8) exts.push('charset="UTF-8"')
  if (exts.length > 0) header += ` ${exts.join(', ')}`
  reply.header('WWW-Authenticate', header)
  reply.code(401)
}

async function verifyBasic (ctx, req, reply, source) {
  const { print, error } = this.bajo.helper
  const { getUserFromUsernamePassword } = this.sumba.helper
  const { getUser } = this.sumba.helper
  const { isEmpty } = this.bajo.helper._
  const setting = await getSetting.call(this, 'basic', source)
  let authInfo
  const parts = (req.headers.authorization || '').split(' ')
  if (parts[0] === setting.type) authInfo = parts[1]
  if (isEmpty(authInfo)) {
    if (setting.realm) {
      await setHeader.call(this, setting, reply)
      throw error('print', { print: print.__(setting.warningMessage) })
    } else return false
  }
  const decoded = Buffer.from(authInfo, 'base64').toString()
  const [username, password] = decoded.split(':')
  try {
    const user = await getUserFromUsernamePassword(username, password, req)
    req.user = await getUser(user)
  } catch (err) {
    if (err.statusCode === 401 && setting.realm) {
      await setHeader.call(this, setting, reply)
      return err.message
    }
    throw err
  }
  return true
}

export default verifyBasic
