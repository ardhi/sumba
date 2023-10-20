import checkUserId from '../../lib/check-user-id.js'
import checkTheme from '../../lib/check-theme.js'
import checkLang from '../../lib/check-lang.js'
import checkDarkMode from '../../lib/check-dark-mode.js'

const onRequest = {
  level: 10,
  handler: async function (ctx, req, reply) {
    const { routePath } = this.bajoWeb.helper
    await checkDarkMode.call(this, req, reply)
    await checkLang.call(this, req, reply)
    await checkTheme.call(this, req, reply)
    await checkUserId.call(this, req, reply, 'bajoWebMpa')
    req.menu = req.menu ?? {}
    if (req.user) {
      req.menu.user = [
        { value: routePath('sumba:/change-password', req), text: 'Change Password' },
        { value: routePath('sumba:/profile', req), text: 'Your Profile' },
        '-',
        { value: routePath('sumba:/signout', req), text: 'Signout' }
      ]
    } else {
      req.menu.user = [
        { value: routePath('sumba:/signin', req), text: 'Signin' },
        '-',
        { value: routePath('sumba:/signup', req), text: 'Signup' },
        { value: routePath('sumba:/forgot-password', req), text: 'Forgot Password' }
      ]
    }
  }
}

export default onRequest
