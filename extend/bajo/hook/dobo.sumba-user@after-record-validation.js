async function doboSumbaUserAfterRecordValidation (body, options) {
  const { isBcrypt, hash } = this.app.bajoExtra
  const { has } = this.lib._

  if (has(body, 'password') && !isBcrypt(body.password)) body.password = await hash(body.password, 'bcrypt')
  // if (has(body, 'token') && !isMd5(body.token)) body.token = await hash(body.token)
}

export default doboSumbaUserAfterRecordValidation
