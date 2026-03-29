async function beforeCreateRecord (body, options = {}) {
  const { token, salt } = await this.resetToken()
  body.token = token
  body.salt = salt
}

export default beforeCreateRecord
