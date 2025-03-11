import { data } from '../../../../lib/token-schema.js'

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

const model = 'SumbaUser'

async function update ({ ctx }) {
  const { importPkg, generateId } = this.app.bajo
  const { recordGet, recordUpdate } = this.app.dobo
  const { hash } = this.app.bajoExtra
  const bcrypt = await importPkg('bajoExtra:bcrypt')

  const schema = { body, response: await response.call(this) }

  const handler = async function get (req, reply, options) {
    const rec = await recordGet(model, req.user.id, { forceNoHidden: true })
    const verified = await bcrypt.compare(req.body.password, rec.password)
    if (!verified) throw this.error('invalidPassword', { details: [{ field: 'password', error: 'invalidPassword' }], statusCode: 400 })
    const input = { salt: generateId() }
    const resp = await recordUpdate(model, req.user.id, input, { forceNoHidden: true })
    return { data: { token: await hash(resp.salt) } }
  }

  return { schema, handler }
}

export default update
