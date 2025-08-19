const model = 'SumbaUser'
const hidden = ['password', 'token', 'siteId']

async function get ({ ctx }) {
  const { recordUpdate } = this.app.waibuDb
  const { omit } = this.lib._

  const { docSchemaModel } = this.app.waibuRestApi
  const schema = await docSchemaModel({ model, method: 'update', ctx, options: { hidden, noId: true } })
  const handler = async function get (req, reply, options) {
    options.hidden = hidden
    const body = omit(req.body, ['username', 'status', ...hidden])
    return await recordUpdate({ model, req, reply, id: req.user.id, body, options })
  }
  return { schema, handler }
}

export default get
