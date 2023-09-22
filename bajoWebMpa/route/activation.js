async function activation (ctx, req, reply) {
  const { getConfig, importPkg, error } = this.bajo.helper
  const { recordFind, recordUpdate } = this.bajoDb.helper
  const { routePath } = this.bajoWeb.helper
  const { isEmpty } = await importPkg('lodash-es')
  const cfg = getConfig('sumba')
  const { key } = req.query
  let err
  if (!isEmpty(key)) {
    try {
      const query = { status: 'UNVERIFIED', token: key }
      const result = await recordFind('SumbaUser', { query }, { skipHook: true })
      if (result.length === 0) throw error('Validation Error', { details: [{ field: 'key', error: 'Invalid activation key' }] })
      await recordUpdate('SumbaUser', result[0].id, { status: 'ACTIVE' })
      const url = routePath(cfg.redirect.signin, req)
      reply.redirect(url)
      return
    } catch (e) {
      err = e
    }
  }
  return reply.view('sumba:/activation', { form: { key }, error: err })
}

export default activation
