const coll = 'SumbaUserSetting'
const hidden = ['userId', 'siteId']

async function get ({ ctx }) {
  const { importPkg } = this.bajo.helper
  const { recordUpdate } = this.bajoWeb.helper
  const { omit } = this.bajo.helper._
  const { docSchemaColl } = this.bajoWebRestapi.helper
  const schema = await docSchemaColl({ coll, method: 'update', ctx, options: { hidden, noId: true } })
  const handler = async function get (ctx, req, reply, options) {
    options.hidden = hidden
    const body = omit(req.body, hidden)
    return await recordUpdate({ coll, req, reply, id: req.user.setting.id, body, options })
  }
  return { schema, handler }
}

export default get
