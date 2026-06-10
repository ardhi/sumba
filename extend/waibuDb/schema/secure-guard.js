async function secureGuard () {
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

export default secureGuard
