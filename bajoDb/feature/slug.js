import slug from 'slug'

async function autoInc ({ schema, body, opts }) {
  const { importPkg } = this.bajo.helper
  const { recordFind } = this.bajoDb.helper
  const { set, last } = await importPkg('lodash-es')
  const query = set({}, opts.fieldName, { $regex: new RegExp('^' + body[opts.fieldName]) })
  const sort = set({}, opts.fieldName, -1)
  const options = { noHook: true, skipCache: true, thrownNotFound: false }
  const resp = await recordFind(schema.name, { query, limit: 1, sort }, options)
  if (resp.length === 0) return body[opts.fieldName]
  const rslugs = resp[0][opts.fieldName].split('-')
  const slugs = body[opts.fieldName].split('-')
  let num
  if (Number(last(rslugs)) && body[opts.fieldName] === rslugs.slice(0, rslugs.length - 1).join('-')) {
    num = Number(rslugs.pop()) + 1
    body[opts.fieldName] = `${rslugs.join('-')}-${num}`
  } else {
    const idx = slugs.length - 1
    num = Number(slugs[idx])
    if (!num) body[opts.fieldName] += '-1'
    else {
      slugs[idx] = num + 1
      body[opts.fieldName] = slugs.join('-')
    }
  }
  return await autoInc.call(this, { schema, body, opts })
}

async function mainFn (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'slug'
  opts.fieldSource = opts.fieldSource ?? ['name']
  opts.autoInc = true
  return {
    properties: [{
      name: opts.fieldName ?? 'slug',
      type: 'string',
      maxLength: 255,
      index: 'unique'
    }],
    hook: {
      beforeCreate: async function ({ schema, body }) {
        const { importPkg, error } = this.bajo.helper
        const { isEmpty, isString } = await importPkg('lodash-es')
        if (isEmpty(body[opts.fieldName])) {
          if (isString(opts.fieldSource)) opts.fieldSource = [opts.fieldSource]
          const source = []
          opts.fieldSource.forEach(s => {
            if (body[s]) source.push(body[s])
          })
          if (isEmpty(source)) {
            const details = [{ field: opts.fieldSource.join(', '), error: 'required' }]
            throw error('\'%s\' is required', opts.fieldSource.join(', '), { details })
          }
          body[opts.fieldName] = slug(source.join(' '))
        }
        if (opts.autoInc) body[opts.fieldName] = await autoInc.call(this, { schema, body, opts })
      }
    }
  }
}

export default mainFn
