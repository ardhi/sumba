import { data } from '../../../../../lib/token-schema.js'

async function get () {
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
    const profile = await this.app.dobo.getModel('SumbaUser').getRecord(req.user.id)
    return { data: { token: profile.apiKey } }
  }
  return { schema, handler }
}

export default get
