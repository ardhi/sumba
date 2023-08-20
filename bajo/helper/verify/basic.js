async function verifyBasic (ctx, req, reply) {
  const { importPkg } = this.bajo.helper
  const { getUserFromUsernamePassword } = this.sumba.helper
  const { isEmpty } = await importPkg('lodash-es')
  let authInfo
  const parts = (req.headers.authorization || '').split(' ')
  if (parts[0] === 'Basic') authInfo = parts[1]
  if (isEmpty(authInfo)) return false
  const decoded = Buffer.from(authInfo, 'base64').toString()
  const [username, password] = decoded.split(':')
  req.user = await getUserFromUsernamePassword(username, password, req)
  return true
}

export default verifyBasic
