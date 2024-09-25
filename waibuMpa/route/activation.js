async function activation (req, reply) {
  const { recordFind, recordUpdate } = this.app.dobo
  const { routePath } = this.app.waibu
  const { isEmpty } = this.app.bajo.lib._

  const { key } = req.query
  let err
  if (!isEmpty(key)) {
    try {
      const query = { status: 'UNVERIFIED', token: key }
      const result = await recordFind('SumbaUser', { query }, { noHook: true })
      if (result.length === 0) throw this.error('Validation Error', { details: [{ field: 'key', error: 'Invalid activation key' }] })
      await recordUpdate('SumbaUser', result[0].id, { status: 'ACTIVE' })
      const url = routePath(this.config.redirect.signin, req)
      reply.redirect(url)
      return
    } catch (e) {
      err = e
    }
  }
  return reply.view('sumba.template:/activation.html', { form: { key }, error: err })
}

export default activation
