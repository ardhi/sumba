import checkUserId from '../../lib/check-user-id.js'
import checkTheme from '../../lib/check-theme.js'
import checkLang from '../../lib/check-lang.js'
import checkDarkMode from '../../lib/check-dark-mode.js'

const onRequest = {
  level: 10,
  handler: async function (ctx, req, reply) {
    await checkDarkMode.call(this, req, reply)
    await checkLang.call(this, req, reply)
    await checkTheme.call(this, req, reply)
    await checkUserId.call(this, req, reply, 'bajoWebMpa')
  }
}

export default onRequest
