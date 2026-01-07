import resetToken from '../../../lib/reset-token.js'

async function beforeCreateRecord (body, options = {}) {
  const { token, salt } = await resetToken.call(this)
  body.token = token
  body.salt = salt
}

export default beforeCreateRecord
