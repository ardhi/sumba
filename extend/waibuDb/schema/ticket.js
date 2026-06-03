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
    }
  }
}

export default ticket
