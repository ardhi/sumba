async function collectProtectedRoutes () {
  const { eachPlugins, readConfig, importPkg } = this.bajo.helper
  const { routeDir } = this.bajoWeb.helper
  const { assetDir, virtualDir } = this.bajoWebStatic.helper
  const { forOwn, trim } = await importPkg('lodash-es')
  this.sumba.protectedRoutes = []
  await eachPlugins(async function ({ file, plugin, alias, dir }) {
    const routes = await readConfig(file, { ignoreError: true })
    let source = trim(file.replace(dir, '').split('@')[0], '/')
    let prefixHandler = routeDir
    if (source.startsWith('bajoWebStatic')) {
      const parts = source.split('.')
      source = parts[0]
      prefixHandler = parts[1] === 'virtual' ? virtualDir : assetDir
    }
    forOwn(routes, (v, k) => {
      const prefix = prefixHandler(plugin, source)
      const inverted = k[0] === '!'
      if (inverted) k = k.slice(1)
      if (k[0] !== '/') k = '/' + k
      this.sumba.protectedRoutes.push({
        path: inverted ? `!${prefix}${k}` : `${prefix}${k}`,
        methods: v,
        plugin,
        source
      })
    })
  }, { glob: '{bajoWebStatic.asset,bajoWebStatic.virtual,bajoWebRestapi,bajoWebMpa}@protected-routes.*' })
}

export default collectProtectedRoutes
