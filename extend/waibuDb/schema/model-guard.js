async function modelGuard () {
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

export default modelGuard
