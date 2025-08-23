export async function collect ({ type = '', handler, container, file, ns, dir }) {
  const { readConfig } = this.app.bajo
  const { routePath, routePathHandlers } = this.app.waibu
  const { camelCase, find, isString, isEmpty } = this.lib._
  let items = await readConfig(file, { ignoreError: true })
  if (isEmpty(items)) items = []

  for (let item of items) {
    if (isString(item)) item = { path: item }
    const routeHandler = item.routeHandler
    delete item.routeHandler
    if (!isEmpty(routeHandler) && !routePathHandlers[routeHandler]) continue
    const rns = routeHandler ? routePathHandlers[routeHandler].ns : 'waibuMpa'
    if (!this.app[rns]) continue
    const isNeg = item.path[0] === '!'
    if (isNeg) item.path = item.path.slice(1)
    item.path = routePath(`${ns}${routeHandler ? ('.' + routeHandler) : ''}:${item.path}`)
    item.methods = item.methods ?? ['*']
    if (handler) await handler.call(this, item)
    const guards = this[camelCase(`${type} ${isNeg ? 'Neg' : ''} ${container}`)]
    if (find(guards, { path: item.path })) continue
    guards.push(item)
  }
}

function handler (item) {
  const { isString } = this.lib._
  for (const k of ['methods']) {
    item[k] = item[k] ?? []
    if (isString(item[k])) item[k] = item[k].split(',')
  }
}

async function collectRoutes (type) {
  const { eachPlugins } = this.app.bajo
  const me = this
  await eachPlugins(async function ({ file, dir }) {
    const { name: ns } = this
    await collect.call(me, { type, container: 'Routes', handler, file, ns, dir })
  }, { glob: `route/${type}.*`, prefix: this.name })
}

export default collectRoutes
