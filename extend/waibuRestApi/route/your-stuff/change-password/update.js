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
    const rec = await this.app.dobo.getModel(model).getRecord(req.user.id, { forceNoHidden: true })
    const verified = await bcrypt.compare(req.body.currentPassword, rec.password)
    if (!verified) throw this.error('invalidCurrentPassword', { details: [{ field: 'current', error: 'invalidPassword' }], statusCode: 400 })
    const input = { password: req.body.password }
    await this.app.dobo.getModel(model).updateRecord(req.user.id, input)
    return {}
  }

  return { schema, handler }
}

export default update
