const indexes = []
const invIndexes = []

async function collect (type, { file, ns, dir }) {
  const { readConfig } = this.app.bajo
  const { routeDir } = this.app.waibu
  const { trim, camelCase } = this.app.bajo.lib._
  const { hash } = this.app.bajoExtra

  const routes = await readConfig(file, { ignoreError: true })
  let source = camelCase(trim(file.replace(dir, '').split('@')[0], '/'))
  let prefixHandler = routeDir
  if (this.app.waibuStatic && source.startsWith('waibuStatic')) {
    const { assetDir, virtualDir } = this.app.waibuStatic
    const parts = source.split('.')
    source = parts[0]
    prefixHandler = parts[1] === 'virtual' ? virtualDir : assetDir
  }
  for (let k in routes) {
    const v = routes[k]
    const prefix = prefixHandler(ns, source)
    const inverted = k[0] === '!'
    if (inverted) k = k.slice(1)
    if (k[0] !== '/') k = '/' + k
    const item = {
      path: `${prefix}${k}`,
      methods: v,
      ns,
      source
    }
    const index = await hash(item)
    if (inverted && type === 'secure') {
      if (!invIndexes.includes(index)) {
        this[`${type}InvRoutes`].push(item)
        invIndexes.push(index)
      }
    } else {
      if (!indexes.includes(index)) {
        this[`${type}Routes`].push(item)
        indexes.push(index)
      }
    }
  }
}

async function collectRoutes (type) {
  const { eachPlugins } = this.app.bajo

  this[`${type}Routes`] = []
  this[`${type}InvRoutes`] = []
  const items = []
  if (this.app.waibuStatic) items.push('waibuStatic.asset', 'waibuStatic.virtual', 'waibu-static.asset', 'waibu-static.virtual')
  if (this.app.waibuRestApi) items.push('waibuRestApi', 'waibu-rest-api')
  if (this.app.waibuMpa) items.push('waibuMpa', 'waibu-mpa')
  const pattern = `{${items.join(',')}}@${type}-routes.*`
  const me = this
  await eachPlugins(async function ({ file, ns, dir }) {
    await collect.call(me, type, { file, ns, dir })
  }, { glob: pattern, baseNs: this.name })
  indexes.splice(0)
  invIndexes.splice(0)
}

export default collectRoutes
