let indexes = []
let invIndexes = []

async function collect ({ file, plugin, dir }) {
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
    if (inverted) {
      if (!invIndexes.includes(index)) {
        this.sumba.excludedRoutes.push(item)
        invIndexes.push(index)
      }
    } else {
      if (!indexes.includes(index)) {
        this.sumba.secureRoutes.push(item)
        indexes.push(index)
      }
    }
  }
}

async function collectSecureRoutes () {
  const { eachPlugins } = this.bajo.helper
  this.sumba.secureRoutes = []
  this.sumba.excludedRoutes = []
  const pattern = '{bajoWebStatic.asset,bajoWebStatic.virtual,bajoWebRestapi,bajoWebMpa}@secure-routes.*'
  await eachPlugins(async function ({ file, plugin, dir }) {
    await collect.call(this, { file, plugin, dir })
  }, { glob: pattern, extend: true })
  indexes = []
  invIndexes = []
}

export default collectSecureRoutes
