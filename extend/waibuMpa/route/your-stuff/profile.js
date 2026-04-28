const profile = {
  method: ['GET'],
  handler: async function (req, reply) {
    const { getRecord } = this.app.waibuDb
    const options = { forceNoHidden: ['token'], noHook: true, noCache: true, attachment: true, mimeType: true, fmt: true }
    const resp = await getRecord({ model: 'SumbaUser', req, id: req.user.id, options })
    const form = resp.data
    return await reply.view('sumba.template:/your-stuff/profile/view.html', { form })
  }
}

export default profile
