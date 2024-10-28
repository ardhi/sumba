const profile = {
  method: ['GET'],
  handler: async function (req, reply) {
    const { hash } = this.app.bajoExtra
    const { recordGet } = this.app.waibuDb
    const resp = await recordGet({ model: 'SumbaUser', req, id: req.user.id, options: { forceNoHidden: true, noHook: true, noCache: true } })
    const form = resp.data
    form.token = await hash(form.token)
    return reply.view('sumba.template:/my-stuff/profile/view.html', { form })
  }
}

export default profile
