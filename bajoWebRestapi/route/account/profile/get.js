const coll = 'SumbaUser'
const hidden = ['password', 'token', 'siteId']

async function get ({ ctx }) {
  const { recordGet } = this.bajoWeb.helper
  const { docSchemaColl } = this.bajoWebRestapi.helper
  const schema = await docSchemaColl({ coll, method: 'get', ctx, options: { hidden, noId: true } })
  const handler = async function get (ctx, req, reply, options) {
    options.hidden = hidden
    return await recordGet({ coll, req, reply, id: req.user.id, options })
  }
  return { schema, handler }
}

export default get
