async function updatePassword (body) {
  const { importPkg } = this.bajo.helper
  const { isBcrypt, hash } = this.bajoExtra.helper
  const { isEmpty } = this.bajo.helper._
  if (isEmpty(body.password)) return
  if (!isBcrypt(body.password)) body.password = await hash(body.password, 'bcrypt')
  body.token = await hash(await hash(body.password))
}

export default updatePassword
