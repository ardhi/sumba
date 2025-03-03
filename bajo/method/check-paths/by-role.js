function byRole ({ paths = [], method = 'GET', roles = [], guards = [] }) {
  const { includes } = this.app.bajo
  const { outmatch } = this.app.bajo.lib

  for (const item of guards) {
    const matchPath = outmatch(item.path)
    for (const path of paths) {
      if (matchPath(path)) {
        const matchMethods = outmatch(item.methods)
        if (matchMethods(method)) {
          if (item.values.length === 0) return item
          if (includes(roles, item.values)) return item
        }
      }
    }
  }
}

export default byRole
