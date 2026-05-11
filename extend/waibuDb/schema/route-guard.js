async function routeGuard () {
  return {
    common: {
      widget: {
        teams: {
          attr: {
            refUrl: 'waibuAdmin:/{prefix}/team/details?id={id}'
          }
        }
      }
    }
  }
}

export default routeGuard
