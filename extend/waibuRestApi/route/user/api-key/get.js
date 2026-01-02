import { data } from '../../../../../lib/token-schema.js'

async function get ({ ctx }) {
  const schema = {
    response: {
      '2xx': {
        description: 'Successfull response',
        type: 'object',
        properties: this.app.waibuRestApi.transformResult({ data })
      }
    }
  }

  const handler = async function (req, reply, options) {
    const { hash } = this.app.bajoExtra

    const profile = await this.app.getModel('SumbaUser').getRecord(req.user.id)
    return { data: { token: await hash(profile.password) } }
  }
  return { schema, handler }
}

export default get
