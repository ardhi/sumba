import collectProtectedRoutes from '../lib/collect-protected-routes.js'

const boot = {
  level: 10,
  handler: async function () {
    this.bajoWeb.instance.decorateRequest('siteId', 'DEFAULT')
    this.bajoWeb.instance.decorateRequest('userId', '')
    await collectProtectedRoutes.call(this)
  }
}

export default boot
