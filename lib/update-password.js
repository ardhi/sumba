async function updatePassword (body) {
  const { isBcrypt, hash } = this.app.bajoExtra
  const { isEmpty } = this.app.bajo.lib._

  if (isEmpty(body.password)) return
  if (!isBcrypt(body.password)) body.password = await hash(body.password, 'bcrypt')
  body.token = await hash(await hash(body.password))
}

export default updatePassword
