import updatePassword from '../../lib/update-password.js'

async function doboSumbaUserBeforeRecordCreate (body, options) {
  await updatePassword.call(this, body)
}

export default doboSumbaUserBeforeRecordCreate
