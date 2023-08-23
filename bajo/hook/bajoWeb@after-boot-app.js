import collectSecureRoutes from '../../lib/collect-secure-routes.js'

async function afterBootApp () {
  await collectSecureRoutes.call(this)
}

export default afterBootApp
