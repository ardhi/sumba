async function afterRecordValidation (body, options) {
  const { isBcrypt, hash } = this.app.bajoExtra
  const { has } = this.app.lib._

  if (has(body, 'password') && !isBcrypt(body.password)) body.password = await hash(body.password, 'bcrypt')
}

export default afterRecordValidation
