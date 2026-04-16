export async function clearCache (id, result) {
  if (!this.app.bajoCache) return
  const { clear } = this.app.bajoCache
  const { get } = this.app.lib._
  await clear({ key: 'dobo|SumbaSite|getSite|default' })
  await clear({ key: `dobo|SumbaSite|getSite|multiSite|${id}` })
  await clear({ key: `dobo|SumbaSite|getSite|multiSite|${get(result, 'data.hostname', get(result, 'oldData.hostname'))}` })
}

async function afterUpdateRecord (id, input, result, opts) {
  await clearCache.call(this, id, result)
}

export default afterUpdateRecord
