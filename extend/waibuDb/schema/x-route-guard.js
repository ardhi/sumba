async function xRouteGuard () {
  return {
    common: {
      widget: {
        siteIds: {
          attr: {
            refUrl: 'waibuAdmin:/{prefix}/site/details?id={id}'
          }
        }
      }
    }
  }
}

export default xRouteGuard
