import updatePassword from '../../lib/update-password.js'

async function doboSumbaUserOnBeforeRecordUpdate (id, body, options) {
  await updatePassword.call(this, body)
}

export default doboSumbaUserOnBeforeRecordUpdate
