let indexes = []
let invIndexes = []

async function collect (type, { file, plugin, dir }) {
  const { readConfig, importPkg } = this.bajo.helper
  const { routeDir } = this.bajoWeb.helper
  const { assetDir, virtualDir } = this.bajoWebStatic.helper
  const { trim } = await importPkg('lodash-es')
  const { hash } = this.bajoExtra.helper
  const routes = await readConfig(file, { ignoreError: true })
  let source = trim(file.replace(dir, '').split('@')[0], '/')
  let prefixHandler = routeDir
  if (source.startsWith('bajoWebStatic')) {
    const parts = source.split('.')
    source = parts[0]
    prefixHandler = parts[1] === 'virtual' ? virtualDir : assetDir
  }
  for (let k in routes) {
    const v = routes[k]
    const prefix = prefixHandler(plugin, source)
    const inverted = k[0] === '!'
    if (inverted) k = k.slice(1)
    if (k[0] !== '/') k = '/' + k
    const item = {
      path: `${prefix}${k}`,
      methods: v,
      plugin,
      source
    }
    const index = await hash(item)
    if (inverted && type === 'secure') {
      if (!invIndexes.includes(index)) {
        this.sumba[`${type}InvRoutes`].push(item)
        invIndexes.push(index)
      }
    } else {
      if (!indexes.includes(index)) {
        this.sumba[`${type}Routes`].push(item)
        indexes.push(index)
      }
    }
  }
}

async function collectRoutes (type) {
  const { eachPlugins } = this.bajo.helper
  this.sumba[`${type}Routes`] = []
  this.sumba[`${type}InvRoutes`] = []
  const pattern = `{bajoWebStatic.asset,bajoWebStatic.virtual,bajoWebRestapi,bajoWebMpa}@${type}-routes.*`
  await eachPlugins(async function ({ file, plugin, dir }) {
    await collect.call(this, type, { file, plugin, dir })
  }, { glob: pattern, extend: true })
  indexes = []
  invIndexes = []
}

export default collectRoutes
