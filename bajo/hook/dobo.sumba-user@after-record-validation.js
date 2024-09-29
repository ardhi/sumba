async function doboSumbaUserBeforeRecordUpdate (body, options) {
  const { isBcrypt, isMd5, hash } = this.app.bajoExtra
  const { isEmpty } = this.app.bajo.lib._

  if (!isEmpty(body.password) && !isBcrypt(body.password)) body.password = await hash(body.password, 'bcrypt')
  if (isEmpty(body.token)) body.token = await hash(await hash(body.password))
  else if (!isMd5(body.token)) body.token = await hash(await hash(body.token))
}

export default doboSumbaUserBeforeRecordUpdate
