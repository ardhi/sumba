import path from 'path'

async function afterReadConfig (file, result, options) {
  const base = path.basename(file, path.extname(file))
  // rewrite fixtures
  if (!(base === 'route-guard' && Array.isArray(result) && file.includes('/fixture/'))) return
  for (const res of result) {
    if (res.path.slice(0, 2) === ':/') res.path = options.sourceNs + res.path
    res.path = res.path.replaceAll('{ns}', options.sourceNs)
  }
}

export default afterReadConfig
