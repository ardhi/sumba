import { data } from '../../../../lib/token-schema.js'

async function get ({ ctx }) {
  const schema = {
    response: {
      '2xx': {
        description: 'Successfull response',
        type: 'object',
        properties: await this.bajoWebRestapi.helper.transformResult({ data })
      }
    }
  }

  const handler = async function get (ctx, req, reply, options) {
    const { recordGet } = this.bajoDb.helper
    const { hash } = this.bajoExtra.helper
    const profile = await recordGet('SumbaUser', req.user.id)
    return { data: { token: await hash(profile.password) } }
  }
  return { schema, handler }
}

export default get
