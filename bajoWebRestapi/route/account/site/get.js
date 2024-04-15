const hidden = []
const coll = 'SumbaSite'

async function get ({ ctx }) {
  const { recordGet } = this.bajoWeb.helper
  const { docSchemaColl } = this.bajoWebRestapi.helper
  const schema = await docSchemaColl({ coll, method: 'get', ctx, options: { hidden, noId: true } })
  const handler = async function get (ctx, req, reply, options) {
    options.hidden = hidden
    return await recordGet({ coll, req, reply, id: req.site.id, options })
  }
  return { schema, handler }
}

export default get
