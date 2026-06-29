async function queryGuard () {
  return {
    common: {
      widget: {
        teamIds: {
          attr: {
            refUrl: 'waibuAdmin:/{prefix}/team/details?id={id}'
          }
        }
      }
    }
  }
}

export default queryGuard
