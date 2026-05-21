async function xAttribGuard () {
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

export default xAttribGuard
