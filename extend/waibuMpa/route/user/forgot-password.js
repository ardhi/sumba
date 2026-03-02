const profile = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    if (!this.app.masohiMail) return await reply.view('sumba.template:/user/forgot-password.html')
    const { defaultsDeep } = this.app.lib.aneka
    const { dayjs } = this.app.lib
    const model = this.app.dobo.getModel('SumbaUser')
    const form = defaultsDeep(req.body, {})
    let error
    if (req.method === 'POST') {
      try {
        const query = { status: 'ACTIVE', $or: [{ username: req.body.usernameEmail }, { email: req.body.usernameEmail }] }
        const result = await model.findRecord({ query, limit: 1 }, { dataOnly: true, noHook: true, forceNoHidden: true })
        if (result.length === 0) throw this.error('validationError', { details: [{ field: 'usernameEmail', error: 'unknownUsernameEmailOrInactive' }] })
        const data = result[0]
        const to = `${data.firstName} ${data.lastName} <${data.email}>`
        const subject = req.t('forgotPasswordLink')
        const options = { req, reply }
        const exp = req.site.setting.sumba.forgotPasswordExpDur
        data.fpToken = Buffer.from(`${data.token}:${dayjs().add(exp, 'ms').unix()}`).toString('base64')
        data._meta = { hostHeader: req.headers.host }
        const payload = { to, subject, data }
        await this.sendMail(
          'sumba.template:/_mail/user-forgot-password-link.html',
          { payload, options, source: this.ns }
        )
        req.flash('notify', req.t('emailSent'))
        return reply.redirectTo(this.config.redirect.signin)
      } catch (err) {
        error = err
      }
    }
    return await reply.view('sumba.template:/user/forgot-password.html', { form, error })
  }
}

export default profile
