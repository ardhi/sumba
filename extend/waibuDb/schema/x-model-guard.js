async function xModelGuard () {
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

export default xModelGuard
