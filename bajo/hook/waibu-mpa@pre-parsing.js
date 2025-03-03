import checkUserId from '../../lib/check-user-id.js'
import checkTheme from '../../lib/check-theme.js'
import checkIconset from '../../lib/check-iconset.js'
import checkRole from '../../lib/check-role.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    const { routePath } = this.app.waibu

    await checkTheme.call(this, req, reply)
    await checkIconset.call(this, req, reply)
    await checkUserId.call(this, req, reply, 'waibuMpa')
    await checkRole.call(this, req, reply, 'waibuMpa')
    req.menu = req.menu ?? {}
    if (req.user) {
      req.menu.user = [
        { value: routePath('sumba:/change-password', req), text: req.t('Change Password') },
        { value: routePath('sumba:/profile', req), text: req.t('yourProfile') },
        '-',
        { value: routePath('sumba:/signout', req), text: req.t('signout') }
      ]
    } else {
      req.menu.user = [
        { value: routePath('sumba:/signin', req), text: req.t('signin') },
        '-',
        { value: routePath('sumba:/signup', req), text: req.t('signup') },
        { value: routePath('sumba:/forgot-password', req), text: req.t('forgotPassword') }
      ]
    }
  }
}

export default preParsing
