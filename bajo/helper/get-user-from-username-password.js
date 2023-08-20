async function getUserByUsernamePassword (username = '', password = '', req) {
  const { error, importPkg } = this.bajo.helper
  const { recordFind } = this.bajoDb.helper
  const bcrypt = await importPkg('bajo-extra:bcrypt')
  const query = { username }
  const rows = await recordFind('SumbaUser', { query }, { req })
  if (rows.length === 0) throw error('Unknown username', { details: [{ field: 'username', error: 'notFound' }], statusCode: 401 })
  const rec = rows[0]
  if (rec.status !== 'ACTIVE') throw error('User is inactive or temporary disabled', { details: [{ field: 'status', error: 'inactive' }], statusCode: 401 })
  const verified = await bcrypt.compare(password, rec.password)
  if (!verified) throw error('Invalid password', { details: [{ field: 'password', error: 'invalid' }], statusCode: 401 })
  return rec
}

export default getUserByUsernamePassword
