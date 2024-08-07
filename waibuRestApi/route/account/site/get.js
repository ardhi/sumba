const hidden = []
const model = 'SumbaSite'

async function get ({ ctx }) {
  const { recordGet } = this.app.waibu
  const { docSchemaModel } = this.app.waibuRestApi

  const schema = await docSchemaModel({ model, method: 'get', ctx, options: { hidden, noId: true } })
  const handler = async function get (ctx, req, reply, options) {
    options.hidden = hidden
    return await recordGet({ model, req, reply, id: req.site.id, options })
  }
  return { schema, handler }
}

export default get
