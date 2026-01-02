const hidden = []
const model = 'SumbaSite'

async function get ({ ctx }) {
  const { getRecord } = this.app.waibuDb
  const { docSchemaModel } = this.app.waibuRestApi

  const schema = await docSchemaModel({ model, method: 'get', ctx, options: { hidden, noId: true } })
  const handler = async function (req, reply, options) {
    options.hidden = hidden
    return await getRecord({ model, req, reply, id: req.site.id, options })
  }
  return { schema, handler }
}

export default get
