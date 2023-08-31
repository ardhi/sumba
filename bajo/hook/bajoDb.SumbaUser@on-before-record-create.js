async function bajoDbSiteUserOnBeforeRecordCreate (body, options) {
  const { importPkg } = this.bajo.helper
  const { isBcrypt, hash } = this.bajoExtra.helper
  const { isEmpty } = await importPkg('lodash-es')
  if (isEmpty(body.password)) return
  if (!isBcrypt(body.password)) body.password = await hash(body.password, 'bcrypt')
  body.token = await hash(await hash(body.password))
}

export default bajoDbSiteUserOnBeforeRecordCreate
