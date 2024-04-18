import { data, body } from '../../../../lib/token-schema.js'

async function create () {
  const schema = {
    body,
    response: {
      '2xx': {
        description: 'Successfull response',
        type: 'object',
        properties: this.bajoWebRestapi.helper.transformResult({ data })
      }
    }
  }

  const handler = async function (ctx, req, reply) {
    const { error } = this.bajo.helper
    const { hash } = this.bajoExtra.helper
    const { getUserFromUsernamePassword, createJwtFromUserRecord } = this.sumba.helper
    if (!['api-key', 'jwt', 'apiKey'].includes(req.params.type)) throw error('Invalid token type')
    const rec = await getUserFromUsernamePassword(req.body.username, req.body.password, req)
    if (req.params.type === 'jwt') {
      const jwt = await createJwtFromUserRecord(rec)
      return { data: jwt }
    }
    return { data: { token: await hash(rec.password) } }
  }
  return { schema, handler }
}

export default create
