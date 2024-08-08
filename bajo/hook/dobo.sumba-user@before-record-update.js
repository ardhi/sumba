import updatePassword from '../../lib/update-password.js'

async function doboSumbaUserBeforeRecordUpdate (id, body, options) {
  await updatePassword.call(this, body)
}

export default doboSumbaUserBeforeRecordUpdate
