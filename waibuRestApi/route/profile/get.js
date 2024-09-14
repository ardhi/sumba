const model = 'SumbaUser'
const hidden = ['password', 'token', 'siteId']

async function get ({ ctx }) {
  const { recordGet } = this.app.waibu
  const { docSchemaModel } = this.app.waibuRestApi
  const schema = await docSchemaModel({ model, method: 'get', ctx, options: { hidden, noId: true } })
  const handler = async function get (req, reply, options) {
    options.hidden = hidden
    return await recordGet({ model, req, reply, id: req.user.id, options })
  }
  return { schema, handler }
}

export default get
