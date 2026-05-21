const routes = [
  'sumba:/your-stuff/**/*',
  'sumba:/signout',
  'sumba:/help/trouble-tickets/**/*',
  'sumba.restapi:/user/api-key',
  'sumba.restapi:/your-stuff/**/*',
  'sumba.restapi:/manage/**/*',
  '~sumba:/user/**/*',
  '~sumba:/signin',
  '~sumba.restapi:/user/access-token/**/*'
]

async function routeGuard () {
  return routes.map(r => {
    const anonymous = r[0] === '~'
    return {
      path: anonymous ? r.slice(1) : r,
      anonymous,
      status: 'ACTIVE'
    }
  })
}

export default routeGuard
