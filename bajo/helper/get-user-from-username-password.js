const coll = 'SumbaUser'

async function getUserByUsernamePassword (username = '', password = '', req) {
  const { error, importPkg } = this.bajo.helper
  const { recordFind, validate } = this.bajoDb.helper
  await validate({ username, password }, 'SumbaUser', { ns: ['sumba', 'bajoDb'], fields: ['username', 'password'] })
  const bcrypt = await importPkg('bajoExtra:bcrypt')
  const query = { username }
  const rows = await recordFind(coll, { query }, { req, ignoreHidden: true, noHook: true })
  if (rows.length === 0) throw error('Unknown username', { details: [{ field: 'username', error: 'Unknown username' }], statusCode: 401 })
  const rec = rows[0]
  if (rec.status !== 'ACTIVE') throw error('User is inactive or temporary disabled', { details: ['User is inactive or temporary disabled'], statusCode: 401 })
  const verified = await bcrypt.compare(password, rec.password)
  if (!verified) throw error('Invalid password', { details: [{ field: 'password', error: 'Invalid password' }], statusCode: 401 })
  return rec
}

export default getUserByUsernamePassword
