const signin = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    let { username, password, referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    let error
    if (req.method === 'POST') {
      try {
        const user = await this.getUserFromUsernamePassword(username, password, req)
        return await this.signin({ user, req, reply })
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/signin.html', { form: { username, referer }, error })
  }
}

export default signin
