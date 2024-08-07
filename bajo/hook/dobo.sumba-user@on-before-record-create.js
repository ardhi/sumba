import updatePassword from '../../lib/update-password.js'

async function doboSumbaUserOnBeforeRecordCreate (body, options) {
  await updatePassword.call(this, body)
}

export default doboSumbaUserOnBeforeRecordCreate
