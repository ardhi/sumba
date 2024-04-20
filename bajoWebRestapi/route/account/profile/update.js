const coll = 'SumbaUser'
const hidden = ['password', 'token', 'siteId']

async function get ({ ctx }) {
  const { recordUpdate } = this.bajoWeb.helper
  const { omit } = this.bajo.helper._
  const { docSchemaColl } = this.bajoWebRestapi.helper
  const schema = await docSchemaColl({ coll, method: 'update', ctx, options: { hidden, noId: true } })
  const handler = async function get (ctx, req, reply, options) {
    options.hidden = hidden
    const body = omit(req.body, ['username', 'status', ...hidden])
    return await recordUpdate({ coll, req, reply, id: req.user.id, body, options })
  }
  return { schema, handler }
}

export default get
