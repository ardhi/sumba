import collectProtectedRoutes from '../lib/collect-protected-routes.js'

const boot = {
  level: 10,
  handler: async function () {
    this.bajoWeb.instance.decorateRequest('site', null)
    this.bajoWeb.instance.decorateRequest('user', null)
    await collectProtectedRoutes.call(this)
  }
}

export default boot
