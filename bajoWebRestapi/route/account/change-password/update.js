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

const coll = 'SumbaUser'

async function update ({ ctx }) {
  const { error, importPkg } = this.bajo.helper
  const { recordGet, recordUpdate } = this.bajoDb.helper
  const bcrypt = await importPkg('bajoExtra:bcrypt')

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

  const handler = async function get (ctx, req, reply, options) {
    const rec = await recordGet(coll, req.user.id)
    const verified = await bcrypt.compare(req.body.currentPassword, rec.password)
    if (!verified) throw error('Invalid current password', { details: [{ field: 'current', error: 'Invalid password' }], statusCode: 400 })
    const input = { password: req.body.password }
    await recordUpdate(coll, req.user.id, input)
    return {}
  }

  return { schema, handler }
}

export default update
