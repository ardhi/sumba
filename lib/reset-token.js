async function resetToken (salt) {
  const { generateId } = this.app.bajo
  const { hash } = this.app.bajoExtra
  salt = salt ?? generateId()
  const token = await hash(await hash(salt))
  return { salt, token }
}

export default resetToken
