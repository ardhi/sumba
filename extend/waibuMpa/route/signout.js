const signout = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    let { referer } = req.body || {}
    if (req.session.ref) referer = req.session.ref
    req.session.ref = null
    if (req.method === 'POST') return this.signout({ req, reply })
    return await reply.view('sumba.template:/signout.html', { form: { referer } })
  }
}

export default signout
