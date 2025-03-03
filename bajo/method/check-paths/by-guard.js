function byGuard ({ guards, paths }) {
  const { outmatch } = this.app.bajo.lib
  const matcher = outmatch(guards)
  let guarded
  for (const path of paths) {
    if (!guarded) guarded = matcher(path)
  }
  return guarded
}

export default byGuard
