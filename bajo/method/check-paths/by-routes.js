function byRoutes ({ paths = [], method = 'GET', guards = [] }) {
  const { outmatch } = this.app.bajo.lib

  for (const item of guards) {
    const matchPath = outmatch(item.path)
    for (const path of paths) {
      if (matchPath(path)) {
        const matchMethods = outmatch(item.values)
        if (matchMethods(method)) return item
      }
    }
  }
}

export default byRoutes
