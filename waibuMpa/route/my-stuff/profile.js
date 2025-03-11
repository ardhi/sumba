const profile = {
  method: ['GET'],
  handler: async function (req, reply) {
    const { hash } = this.app.bajoExtra
    const { recordGet } = this.app.waibuDb
    const options = { forceNoHidden: true, noHook: true, noCache: true, attachment: true, mimeType: true }
    const resp = await recordGet({ model: 'SumbaUser', req, id: req.user.id, options })
    const form = resp.data
    form.token = await hash(form.salt)
    return reply.view('sumba.template:/my-stuff/profile/view.html', { form })
  }
}

export default profile
