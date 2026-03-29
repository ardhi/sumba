async function beforeUpdateRecord (id, body, options = {}) {
  if (body.salt) {
    const { token, salt } = await this.resetToken(body.salt)
    body.token = token
    body.salt = salt
  }
}

export default beforeUpdateRecord
