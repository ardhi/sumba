const profile = {
  method: ['GET', 'POST'],
  handler: async function (ctx, req, reply) {
    const { defaultsDeep, importPkg } = this.bajo.helper
    const { attachmentCopyUploaded } = this.bajoDb.helper
    const { recordUpdate } = this.bajoWeb.helper
    const { has } = this.bajo.helper._
    let form = defaultsDeep(req.body, req.user)
    if (req.method === 'POST') {
      try {
        if (has(req.body, 'profile')) {
          const opts = { req, setField: 'profile', setFile: 'main.png' }
          await attachmentCopyUploaded('SumbaUser', req.user.id, opts)
        } else {
          form = (await recordUpdate({ coll: 'SumbaUser', id: req.user.id, body: form, req })).data
        }
      } catch (err) {
      }
    }
    return reply.view('sumba:/change-password', { form })
  }
}

export default profile
