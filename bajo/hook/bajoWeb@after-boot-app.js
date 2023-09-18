import collectRoutes from '../../lib/collect-routes.js'

async function afterBootApp () {
  await collectRoutes.call(this, 'secure')
  await collectRoutes.call(this, 'anonymous')
}

export default afterBootApp
