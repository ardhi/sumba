import updatePassword from '../../lib/update-password.js'

async function bajoDbSiteUserOnBeforeRecordCreate (body, options) {
  await updatePassword.call(this, body)
}

export default bajoDbSiteUserOnBeforeRecordCreate
