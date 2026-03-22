import { checkUserId, checkTeam, checkTheme, checkIconset } from '../../../lib/util.js'

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
