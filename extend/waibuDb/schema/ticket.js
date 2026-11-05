async function ticket () {
  const { routePath } = this.app.waibu
  return {
    common: {
      widget: {
        subject: {
          attr: {
            col: '8-md'
          }
        },
        message: {
          attr: {
            rows: 10
          }
        },
        cat: {
          addons: [{
            attr: {
              'x-data': true,
              '@click': `location.href='${routePath('waibuAdmin:/site/ticket-cat/add')}'`,
              icon: 'add'
            },
            type: 'button',
            position: 'append'
          }]
        },
        userId: {
          attr: {
            url: 'sumba.restapi:/manage/user'
          }
        }
      }
    },
    view: {
      list: {
        stat: {
          aggregate: [
            { fields: ['status'], group: 'status', aggregate: ['count'] },
            { fields: ['cat'], group: 'cat', aggregate: ['count'] },
            { fields: ['allTeams'], group: 'allTeams', aggregate: ['count'] }
          ]
        }
      }
    }
  }
}

export default ticket
