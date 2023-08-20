async function create (ctx, req, reply) {
  const { error } = this.bajo.helper
  const { hash } = this.bajoExtra.helper
  const { getUserFromUsernamePassword, createJwtFromUserRecord } = this.sumba.helper
  if (!['api-key', 'jwt', 'apiKey'].includes(req.params.type)) throw error('Invalid token type')
  try {
    const rec = await getUserFromUsernamePassword(req.body.username, req.body.password, req)
    if (req.params.type === 'jwt') {
      const jwt = await createJwtFromUserRecord(rec)
      return { data: jwt }
    }
    return { data: { token: await hash(rec.password) } }
  } catch (err) {
    err.statusCode = 500
    delete err.details
    throw err
  }
}

export default create
