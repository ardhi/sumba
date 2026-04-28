import { data } from '../../../../../lib/token-schema.js'

export function response () {
  return {
    '2xx': {
      description: 'Successfull response',
      type: 'object',
      properties: this.app.waibuRestApi.transformResult({ data })
    }
  }
}

export const body = {
  type: 'object',
  properties: {
    password: {
      type: 'string'
    }
  }
}

async function update () {
  const { importPkg } = this.app.bajo
  const { generateId } = this.app.lib.aneka
  const bcrypt = await importPkg('bajoExtra:bcrypt')
  const model = this.app.dobo.getModel('SumbaUser')

  const schema = { body, response: await response.call(this) }

  const handler = async function get (req, reply, options) {
    const rec = await model.getRecord(req.user.id, { forceNoHidden: true })
    const verified = await bcrypt.compare(req.body.password, rec.password)
    if (!verified) throw this.error('invalidPassword', { details: [{ field: 'password', error: 'invalidPassword' }], statusCode: 400 })
    const input = { salt: generateId() }
    const resp = await model.updateRecord(req.user.id, input, { forceNoHidden: true })
    return { data: { token: resp.apiKey } }
  }

  return { schema, handler }
}

export default update
