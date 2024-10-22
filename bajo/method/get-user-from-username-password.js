const model = 'SumbaUser'

async function getUserByUsernamePassword (username = '', password = '', req) {
  const { importPkg } = this.app.bajo
  const { recordFind, validate } = this.app.dobo
  await validate({ username, password }, 'SumbaUser', { ns: ['sumba', 'dobo'], fields: ['username', 'password'] })
  const bcrypt = await importPkg('bajoExtra:bcrypt')

  const query = { username }
  const rows = await recordFind(model, { query }, { req, forceNoHidden: true, noHook: true })
  if (rows.length === 0) throw this.error('Validation Error', { details: [{ field: 'username', error: 'Unknown username' }], statusCode: 401 })
  const rec = rows[0]
  if (rec.status !== 'ACTIVE') throw this.error('Validation Error', { details: ['User is inactive or temporarily disabled'], statusCode: 401 })
  const verified = await bcrypt.compare(password, rec.password)
  if (!verified) throw this.error('Validation Error', { details: [{ field: 'password', error: 'Invalid password' }], statusCode: 401 })
  return rec
}

export default getUserByUsernamePassword
