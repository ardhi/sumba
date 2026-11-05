async function actionGuard () {
  return {
    common: {
      widget: {
        teamIds: {
          attr: {
            refUrl: 'waibuAdmin:/{prefix}/team/details?id={id}'
          }
        }
      }
    },
    view: {
      list: {
        stat: {
          aggregate: [
            { fields: ['status'], group: 'status', aggregate: ['count'] },
            { fields: ['weight'], group: 'weight', aggregate: ['count'] },
            { fields: ['allTeams'], group: 'allTeams', aggregate: ['count'] }
          ]
        }
      }
    }
  }
}

export default actionGuard
