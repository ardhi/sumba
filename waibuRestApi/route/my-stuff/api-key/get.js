import { response } from './update.js'

async function get ({ ctx }) {
  const { hash } = this.app.bajoExtra
  const { recordGet } = this.app.dobo
  const schema = { response: await response.call(this) }
  const handler = async function get (req, reply) {
    const rec = await recordGet('SumbaUser', req.user.id, { forceNoHidden: true })
    return { data: { token: await hash(rec.salt) } }
  }
  return { schema, handler }
}

export default get
