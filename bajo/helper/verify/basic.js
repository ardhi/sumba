async function verifyBasic (req) {
  const { importPkg } = this.bajo.helper
  const { getUserByUsernamePassword } = this.sumba.helper
  const { isEmpty } = await importPkg('lodash-es')
  let authInfo
  const parts = (req.headers.authorization || '').split(' ')
  if (parts[0] === 'Basic') authInfo = parts[1]
  if (isEmpty(authInfo)) return false
  const decoded = Buffer.from(authInfo, 'base64').toString()
  const [username, password] = decoded.split(':')
  req.user = await getUserByUsernamePassword(username, password, req)
  return true
}

export default verifyBasic
