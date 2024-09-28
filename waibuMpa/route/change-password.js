const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep, importPkg } = this.app.bajo
    const { isEmpty } = this.app.bajo.lib._
    const { recordGet, recordUpdate } = this.app.dobo
    const bcrypt = await importPkg('bajoExtra:bcrypt')
    const model = 'SumbaUser'

    const form = defaultsDeep(req.body, {})
    let error
    if (req.method === 'POST') {
      try {
        const details = []
        for (const field of ['currentPassword', 'newPassword', 'verifyNewPassword']) {
          if (isEmpty(req.body[field])) details.push({ field, error: 'validation.any.required' })
        }
        if (req.body.newPassword !== req.body.verifyNewPassword) details.push({ field: 'verifyNewPassword', ext: { type: 'any.only', context: { ref: req.t('field.newPassword') } } })
        if (details.length > 0) throw this.error('Validation Error', { details, statusCode: 400 })
        const rec = await recordGet(model, req.user.id)
        const verified = await bcrypt.compare(req.body.currentPassword, rec.password)
        if (!verified) throw this.error('Invalid current password', { details: [{ field: 'currentPassword', error: 'Invalid password' }], statusCode: 400 })
        const input = { password: req.body.newPassword }
        await recordUpdate(model, req.user.id, input)
        // signout and redirect to signin
        req.session.user = null
        req.flash('notify', req.t('You\'ve successfully changed your password!'))
        return reply.redirectTo('sumba:/signin')
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/change-password.html', { form, error })
  }
}

export default profile
