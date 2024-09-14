const data = {
  success: {
    type: 'boolean',
    default: true
  },
  statusCode: {
    type: 'integer',
    default: 200
  }
}

export const body = {
  type: 'object',
  properties: {
    currentPassword: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  }
}

const model = 'SumbaUser'

async function update ({ ctx }) {
  const { importPkg } = this.app.bajo
  const { recordGet, recordUpdate } = this.app.dobo
  const bcrypt = await importPkg('bajoExtra:bcrypt')

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

  const handler = async function get (req, reply, options) {
    const rec = await recordGet(model, req.user.id)
    const verified = await bcrypt.compare(req.body.currentPassword, rec.password)
    if (!verified) throw this.error('Invalid current password', { details: [{ field: 'current', error: 'Invalid password' }], statusCode: 400 })
    const input = { password: req.body.password }
    await recordUpdate(model, req.user.id, input)
    return {}
  }

  return { schema, handler }
}

export default update
