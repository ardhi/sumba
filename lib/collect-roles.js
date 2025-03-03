async function collect ({ file, ns, dir }) {
  const { readConfig } = this.app.bajo
  const { routePath } = this.app.waibu
  const { camelCase, isString, find } = this.app.bajo.lib._

  const roles = await readConfig(file, { ignoreError: true })
  const [item] = file.replace(dir, '').split('@')
  let [source, subNs] = item.split('.').map(s => camelCase(s))
  subNs = subNs ? `.${subNs}` : ''
  for (const k in roles) {
    const values = isString(roles[k]) ? [roles[k]] : roles[k]
    let [path, methods] = k.split(':')
    const isNeg = path[0] === '!'
    if (isNeg) path = path.slice(1)
    path = routePath(`${ns}${subNs}:${path}`)
    const item = {
      source,
      path,
      methods: methods.split(','),
      values
    }
    const guards = this[isNeg ? 'negRoles' : 'roles']
    if (find(guards, { path })) continue
    guards.push(item)
  }
}

async function collectRoles () {
  const { eachPlugins } = this.app.bajo

  this.roles = this.roles ?? []
  this.negRoles = this.negRoles ?? []
  const items = []
  if (this.app.waibuStatic) items.push('waibuStatic.asset', 'waibuStatic.virtual', 'waibu-static.asset', 'waibu-static.virtual')
  if (this.app.waibuRestApi) items.push('waibuRestApi', 'waibu-rest-api')
  if (this.app.waibuMpa) items.push('waibuMpa', 'waibu-mpa')
  const pattern = `{${items.join(',')}}@roles.*`
  const me = this
  await eachPlugins(async function ({ file, ns, dir }) {
    await collect.call(me, { file, ns, dir })
  }, { glob: pattern, prefix: this.name })
}

export default collectRoles
