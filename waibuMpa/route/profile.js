const profile = {
  method: ['GET'],
  handler: async function (req, reply) {
    const { hash } = this.app.bajoExtra
    const form = req.user
    form.token = await hash(form.token)
    return reply.view('sumba.template:/profile/view.html', { form })
  }
}

export default profile
