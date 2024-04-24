async function getUser (rec, safe = true) {
  const { getConfig } = this.bajo.helper
  const { recordGet } = this.bajoDb.helper
  const { omit, isPlainObject } = this.bajo.helper._
  const cfg = getConfig('sumba')
  let user
  if (isPlainObject(rec)) user = rec
  else user = await recordGet('SumbaUser', rec, { noHook: true })
  return safe ? omit(user, cfg.auth.common.omitUserFields) : user
}

export default getUser
