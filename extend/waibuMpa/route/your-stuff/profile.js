const profile = {
  method: ['GET'],
  handler: async function (req, reply) {
    const { hash } = this.app.bajoExtra
    const { getRecord } = this.app.waibuDb
    const options = { forceNoHidden: ['token'], noHook: true, noCache: true, attachment: true, mimeType: true, formatValue: true, retainOriginalValue: true }
    const resp = await getRecord({ model: 'SumbaUser', req, id: req.user.id, options })
    const form = resp.data
    form.token = await hash(form.salt)
    return await reply.view('sumba.template:/your-stuff/profile/view.html', { form })
  }
}

export default profile
