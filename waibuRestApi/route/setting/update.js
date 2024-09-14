const model = 'SumbaUserSetting'
const hidden = ['userId', 'siteId']

async function get ({ ctx }) {
  const { recordUpdate } = this.app.waibu
  const { omit } = this.app.bajo.lib._
  const { docSchemaModel } = this.app.waibuRestApi

  const schema = await docSchemaModel({ model, method: 'update', ctx, options: { hidden, noId: true } })
  const handler = async function (req, reply, options) {
    options.hidden = hidden
    const body = omit(req.body, hidden)
    return await recordUpdate({ model, req, reply, id: req.user.setting.id, body, options })
  }
  return { schema, handler }
}

export default get
