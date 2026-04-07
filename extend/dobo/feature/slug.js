import slug from 'slug'

async function autoInc (body, opts) {
  const { set, last } = this.app.lib._
  const query = set({}, opts.field, { $regex: new RegExp('^' + body[opts.field]) })
  const sort = set({}, opts.field, -1)
  const options = { noHook: true, skipCache: true, thrownNotFound: false }
  const resp = await this.findOneRecord({ query, sort }, options)
  if (resp) return body[opts.field]
  const rslugs = resp[opts.field].split('-')
  const slugs = body[opts.field].split('-')
  let num
  if (Number(last(rslugs)) && body[opts.field] === rslugs.slice(0, rslugs.length - 1).join('-')) {
    num = Number(rslugs.pop()) + 1
    body[opts.field] = `${rslugs.join('-')}-${num}`
  } else {
    const idx = slugs.length - 1
    num = Number(slugs[idx])
    if (!num) body[opts.field] += '-1'
    else {
      slugs[idx] = num + 1
      body[opts.field] = slugs.join('-')
    }
  }
  return await autoInc.call(this, body, opts)
}

async function mainFn (opts = {}) {
  opts.field = opts.field ?? 'slug'
  opts.fieldSource = opts.fieldSource ?? ['name']
  opts.autoInc = true
  return {
    properties: [{
      name: opts.field ?? 'slug',
      type: 'string',
      maxLength: 255,
      index: 'unique'
    }],
    hook: {
      beforeCreate: async function (body) {
        const { error } = this.app.bajo
        const { isEmpty, isString } = this.app.lib._
        if (isEmpty(body[opts.field])) {
          if (isString(opts.fieldSource)) opts.fieldSource = [opts.fieldSource]
          const source = []
          opts.fieldSource.forEach(s => {
            if (body[s]) source.push(body[s])
          })
          if (isEmpty(source)) {
            const details = [{ field: opts.fieldSource.join(', '), error: 'required' }]
            throw error('\'%s\' is required', opts.fieldSource.join(', '), { details })
          }
          body[opts.field] = slug(source.join(' '))
        }
        if (opts.autoInc) body[opts.field] = await autoInc.call(this, body, opts)
      }
    }
  }
}

export default mainFn
