async function getUser (rec, safe = true) {
  const { getConfig, importPkg } = this.bajo.helper
  const { recordGet } = this.bajoDb.helper
  const { omit, isString } = await importPkg('lodash-es')
  const cfg = getConfig('sumba')
  let user
  if (isString(rec)) user = await recordGet('SumbaUser', rec, { skipHook: true })
  else user = rec
  return safe ? omit(user, cfg.auth.common.omitUserFields) : user
}

export default getUser
