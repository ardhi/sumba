import checkUserId from '../../../lib/check-user-id.js'
import checkTheme from '../../../lib/check-theme.js'
import checkIconset from '../../../lib/check-iconset.js'
import checkTeam from '../../../lib/check-team.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    // const { routePath } = this.app.waibu

    await checkTheme.call(this, req, reply)
    await checkIconset.call(this, req, reply)
    await checkUserId.call(this, req, reply, 'waibuMpa')
    await checkTeam.call(this, req, reply, 'waibuMpa')
    /*
    req.menu = req.menu ?? {}
    if (req.user) {
      req.menu.user = [
        { value: routePath('sumba:/your-stuff/change-password', req), text: req.t('Change Password') },
        { value: routePath('sumba:/your-stuff/profile', req), text: req.t('yourProfile') },
        '-',
        { value: routePath('sumba:/signout', req), text: req.t('signout') }
      ]
    } else {
      req.menu.user = [
        { value: routePath('sumba:/signin', req), text: req.t('signin') },
        '-',
        { value: routePath('sumba:/user/signup', req), text: req.t('signup') },
        { value: routePath('sumba:/user/forgot-password', req), text: req.t('forgotPassword') }
      ]
    }
    */
  }
}

export default preParsing
