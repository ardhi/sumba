const unsafeFields = ['password']

async function getUser (rec, safe = true) {
  const { recordGet } = this.app.dobo
  const { omit, isPlainObject } = this.app.bajo.lib._

  let user
  if (isPlainObject(rec)) user = rec
  else user = await recordGet('SumbaUser', rec, { noHook: true })
  return safe ? omit(user, unsafeFields) : user
}

export default getUser
