async function bajoDbSiteUserOnBeforeCreate (body, options) {
  const { importPkg } = this.bajo.helper
  const { isBcrypt, hash } = this.bajoExtra.helper
  const { isEmpty, get } = await importPkg('lodash-es')
  if (isEmpty(body.password)) return
  if (!isBcrypt(body.password)) body.password = await hash(body.password, 'bcrypt')
  const siteId = get(options, 'req.siteId')
  if (siteId) body.siteId = siteId
  body.token = await hash(await hash(body.password))
}

export default bajoDbSiteUserOnBeforeCreate
