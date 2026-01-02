import resetToken from '../../../lib/reset-token.js'

async function beforeRecordUpdate (id, body, options = {}) {
  if (body.salt) {
    const { token, salt } = await resetToken.call(this, body.salt)
    body.token = token
    body.salt = salt
  }
}

export default beforeRecordUpdate
