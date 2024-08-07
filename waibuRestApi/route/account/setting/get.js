const model = 'SumbaUserSetting'
const hidden = ['userId', 'siteId']

async function get ({ ctx }) {
  const { recordFindOne } = this.app.waibu
  const { docSchemaModel } = this.app.waibuRestApi

  const schema = await docSchemaModel({ model, method: 'get', ctx, options: { hidden, noId: true } })
  const handler = async function get (ctx, req, reply, options) {
    options.filter = { query: { userId: req.user.id }, limit: 1 }
    options.hidden = hidden
    return await recordFindOne({ model, req, reply, options })
  }
  return { schema, handler }
}

export default get
