import checkUserId from '../../../lib/check-user-id.js'
import checkTheme from '../../../lib/check-theme.js'
import checkIconset from '../../../lib/check-iconset.js'
import checkTeam from '../../../lib/check-team.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    await checkTheme.call(this, req, reply)
    await checkIconset.call(this, req, reply)
    await checkUserId.call(this, req, reply, 'waibuMpa')
    await checkTeam.call(this, req, reply, 'waibuMpa')
  }
}

export default preParsing
