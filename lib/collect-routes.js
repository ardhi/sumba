export async function collect ({ type = '', handler, container, file, ns, dir }) {
  const { readConfig } = this.app.bajo
  const { routePath } = this.app.waibu
  const { camelCase, find } = this.app.bajo.lib._

  const items = await readConfig(file, { ignoreError: true })
  const [item] = file.replace(dir, '').split('@')
  let [source, subNs] = item.split('.').map(s => camelCase(s))
  subNs = subNs ? `.${subNs}` : ''

  for (const item of items) {
    item.source = source
    const isNeg = item.path[0] === '!'
    if (isNeg) item.path = item.path.slice(1)
    item.path = routePath(`${ns}${subNs}:${item.path}`)
    item.methods = item.methods ?? ['*']
    if (handler) await handler.call(this, item)
    const guards = this[camelCase(`${type} ${isNeg ? 'Neg' : ''} ${container}`)]
    if (find(guards, { path: item.path })) continue
    guards.push(item)
  }
}

function handler (item) {
  const { isString } = this.app.bajo.lib._
  for (const k of ['methods']) {
    item[k] = item[k] ?? []
    if (isString(item[k])) item[k] = item[k].split(',')
  }
}

async function collectRoutes (type) {
  const { eachPlugins } = this.app.bajo

  this[`${type}Routes`] = this[`${type}Routes`] ?? []
  this[`${type}NegRoutes`] = this[`${type}NegRoutes`] ?? []
  const items = []
  if (this.app.waibuStatic) items.push('waibuStatic.asset', 'waibuStatic.virtual', 'waibu-static.asset', 'waibu-static.virtual')
  if (this.app.waibuRestApi) items.push('waibuRestApi', 'waibu-rest-api')
  if (this.app.waibuMpa) items.push('waibuMpa', 'waibu-mpa')
  const pattern = `{${items.join(',')}}@${type}-routes.*`
  const me = this
  await eachPlugins(async function ({ file, ns, dir }) {
    await collect.call(me, { type, container: 'Routes', handler, file, ns, dir })
  }, { glob: pattern, prefix: this.name })
}

export default collectRoutes
