async function createJwtFromUserRecord (rec) {
  const { importPkg, getConfig, dayjs } = this.bajo.helper
  const { hash } = this.bajoExtra.helper
  const { get, pick } = this.bajo.helper._
  const fastJwt = await importPkg('bajoExtra:fast-jwt')
  const { createSigner } = fastJwt

  const cfg = getConfig('sumba')
  const opts = pick(cfg.auth.common.jwt, ['expiresIn'])
  opts.key = get(cfg, 'auth.common.jwt.secret')
  const sign = createSigner(opts)
  const apiKey = await hash(rec.password)
  const payload = { uid: rec.id, apiKey }
  const token = await sign(payload)
  const expiresAt = dayjs().add(opts.expiresIn).toDate()
  return { token, expiresAt }
}

export default createJwtFromUserRecord
