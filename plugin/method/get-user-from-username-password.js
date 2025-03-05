const model = 'SumbaUser'

async function getUserByUsernamePassword (username = '', password = '', req) {
  const { importPkg } = this.app.bajo
  const { recordFind, validate } = this.app.dobo
  await validate({ username, password }, 'SumbaUser', { ns: ['sumba', 'dobo'], fields: ['username', 'password'] })
  const bcrypt = await importPkg('bajoExtra:bcrypt')

  const query = { username }
  const rows = await recordFind(model, { query }, { req, forceNoHidden: true, noHook: true })
  if (rows.length === 0) throw this.error('validationError', { details: [{ field: 'username', error: 'Unknown username' }], statusCode: 401 })
  const rec = rows[0]
  if (rec.status !== 'ACTIVE') throw this.error('validationError', { details: ['User is inactive or temporarily disabled'], statusCode: 401 })
  const verified = await bcrypt.compare(password, rec.password)
  if (!verified) throw this.error('validationError', { details: [{ field: 'password', error: 'invalidPassword' }], statusCode: 401 })
  return rec
}

export default getUserByUsernamePassword
