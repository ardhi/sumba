const coll = 'SumbaUserSetting'
const hidden = ['userId', 'siteId']

async function get ({ ctx }) {
  const { recordFindOne } = this.bajoWeb.helper
  const { docSchemaColl } = this.bajoWebRestapi.helper
  const schema = await docSchemaColl({ coll, method: 'get', ctx, options: { hidden, noId: true } })
  const handler = async function get (ctx, req, reply, options) {
    options.filter = { query: { userId: req.user.id }, limit: 1 }
    options.hidden = hidden
    return await recordFindOne({ coll, req, reply, options })
  }
  return { schema, handler }
}

export default get
