async function createJwtFromUserRecord (rec) {
  const { importPkg } = this.app.bajo
  const { dayjs } = this.app.bajo.lib
  const { hash } = this.app.bajoExtra
  const { get, pick } = this.app.bajo.lib._

  const fastJwt = await importPkg('bajoExtra:fast-jwt')
  const { createSigner } = fastJwt

  const opts = pick(this.config.auth.common.jwt, ['expiresIn'])
  opts.key = get(this.config, 'auth.common.jwt.secret')
  const sign = createSigner(opts)
  const apiKey = await hash(rec.password)
  const payload = { uid: rec.id, apiKey }
  const token = await sign(payload)
  const expiresAt = dayjs().add(opts.expiresIn).toDate()
  return { token, expiresAt }
}

export default createJwtFromUserRecord
