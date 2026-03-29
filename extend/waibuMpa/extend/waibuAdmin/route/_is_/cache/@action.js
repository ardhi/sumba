const action = {
  method: ['GET', 'POST'],
  title: 'cacheStorage',
  interSite: true,
  handler: async function (req, reply) {
    if (!this.app.bajoCache) throw this.error('_notFound')
    const { importModule } = this.app.bajo
    const crudSkel = await importModule('waibuAdmin:/lib/crud-skel.js')
    return await crudSkel.call(this, 'CacheStorage', req, reply)
  }
}

export default action
