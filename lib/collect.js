export async function collect ({ type = '', handler, container, file, ns, dir }) {
  const { readConfig } = this.app.bajo
  const { parseRouteGuard } = this
  const { camelCase, find, isEmpty } = this.app.lib._
  let items = await readConfig(file, { ns, baseNs: this.ns, defValue: [] })
  if (isEmpty(items)) items = []
  for (let item of items) {
    item = parseRouteGuard(item)
    if (!item) continue
    if (handler) await handler.call(this, item)
    const guards = this[camelCase(`${type} ${item.reverse ? 'Neg' : ''} ${container}`)]
    delete item.reverse
    if (find(guards, { path: item.path })) continue
    guards.push(item)
  }
}

function collectHandler (item, keys = []) {
  const { isString } = this.app.lib._
  for (const k of keys) {
    item[k] = item[k] ?? []
    if (isString(item[k])) item[k] = item[k].split(',')
  }
}

export async function collectRoutes (type) {
  const { eachPlugins } = this.app.bajo
  const me = this

  function handler (item) {
    collectHandler.call(this, item, ['methods'])
  }

  await eachPlugins(async function ({ file, dir }) {
    const { ns } = this
    await collect.call(me, { type, container: 'Routes', handler, file, ns, dir })
  }, { glob: `route-guard/${type}.*`, prefix: this.ns })
}

export async function collectTeam () {
  const { eachPlugins } = this.app.bajo
  const me = this

  function handler (item) {
    collectHandler.call(this, item, ['methods', 'teams', 'features'])
  }

  await eachPlugins(async function ({ file, dir }) {
    const { ns } = this
    await collect.call(me, { type: 'team', container: 'Routes', handler, file, ns, dir })
  }, { glob: 'route/team.*', prefix: this.ns })
}
