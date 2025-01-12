import { data, body } from '../../../../../lib/token-schema.js'

async function create () {
  const schema = {
    body,
    response: {
      '2xx': {
        description: 'Successfull response',
        type: 'object',
        properties: this.app.waibuRestApi.transformResult({ data })
      }
    }
  }

  const handler = async function (req, reply) {
    const { hash } = this.app.bajoExtra
    const { getUserFromUsernamePassword, createJwtFromUserRecord } = this

    if (!['api-key', 'jwt', 'apiKey'].includes(req.params.type)) throw this.error('Invalid token type')
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
