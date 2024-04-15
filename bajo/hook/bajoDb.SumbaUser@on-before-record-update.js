import updatePassword from '../../lib/update-password.js'

async function bajoDbSiteUserOnBeforeRecordUpdate (id, body, options) {
  await updatePassword.call(this, body)
}

export default bajoDbSiteUserOnBeforeRecordUpdate
