import checkUserId from '../../lib/check-user-id.js'
import checkTheme from '../../lib/check-theme.js'
import checkIconset from '../../lib/check-iconset.js'

const onRequest = {
  level: 10,
  handler: async function (ctx, req, reply) {
    const { routePath } = this.app.waibu

    await checkTheme.call(this, req, reply)
    await checkIconset.call(this, req, reply)
    await checkUserId.call(this, req, reply, 'waibuMpa')
    req.menu = req.menu ?? {}
    if (req.user) {
      req.menu.user = [
        { value: routePath('sumba:/change-password', req), text: req.i18n.t('Change Password') },
        { value: routePath('sumba:/profile', req), text: req.i18n.t('Your Profile') },
        '-',
        { value: routePath('sumba:/signout', req), text: req.i18n.t('Signout') }
      ]
    } else {
      req.menu.user = [
        { value: routePath('sumba:/signin', req), text: req.i18n.t('Signin') },
        '-',
        { value: routePath('sumba:/signup', req), text: req.i18n.t('Signup') },
        { value: routePath('sumba:/forgot-password', req), text: req.i18n.t('Forgot Password') }
      ]
    }
  }
}

export default onRequest
