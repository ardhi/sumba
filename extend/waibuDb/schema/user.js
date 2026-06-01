async function user ({ req } = {}) {
  const { merge } = this.app.lib._
  const { routePath } = this.app.waibu
  const details = {
    layout: [
      { name: 'meta', fields: ['id:3', 'createdAt:3', 'updatedAt:3', 'status:3'] },
      { name: 'account', fields: ['username:3', 'email:3', 'provider:3', 'password:3', 'firstName:3', 'lastName:3', 'apiKey:6'] },
      { name: 'address', fields: ['address1:12', 'address2:12', 'city:6-md 8-sm', 'zipCode:2-md 4-sm', 'provinceState:4-md', 'country:6-md', 'phone:6-md', 'website:12'] },
      { name: 'socialMedia', fields: ['socX:3-md 6-sm', 'socInstagram:3-md 6-sm', 'socFacebook:3-md 6-sm', 'socLinkedIn:3-md 6-sm'] }
    ],
    forceVisible: ['password', 'token'],
    format: {
      password: function (val, rec) {
        return {
          value: '*************',
          icon: 'arrowsRepeat',
          href: routePath('waibuAdmin:/site/reset-user-password', { query: { username: rec.username } })
        }
        // return `<a href="waibuAdmin:/site/reset-user-password?username=${rec.username}">${req.t('resetPassword')}</a>`
      }
    },
    widget: {
      username: {
        attr: {
          id: 'fusername'
        }
      },
      password: {
        component: 'form-plaintext',
        attr: {
          font: 'monospace'
        }
        /*
        addons: [{
          attr: {
            'x-data': true,
            '@click': `location.href='${routePath('waibuAdmin:/site/reset-user-password?username=')}' + document.getElementById('fusername').textContent`,
            icon: 'arrowsRepeat'
          },
          type: 'button',
          position: 'append'
        }]
        */
      },
      apiKey: {
        attr: {
          id: 'fapi-key',
          text: 'truncate'
        },
        addons: [{
          attr: {
            'x-data': true,
            '@click': "await wbs.copyToClipboard('#fapi-key', true)",
            icon: 'copy'
          },
          type: 'button',
          position: 'append'
        }]
      }
    }
  }
  return {
    view: {
      list: {
        qs: {
          sort: 'username:1',
          limit: 10
        },
        fields: ['createdAt', 'status', 'username', 'provider', 'email', 'firstName', 'lastName', 'city', 'zipCode', 'provinceState', 'country', 'phone'],
        stat: {
          aggregate: [
            { fields: ['status'], group: 'status', aggregate: ['count'] },
            { fields: ['provider'], group: 'provider', aggregate: ['count'] },
            { fields: ['country'], group: 'country', aggregate: ['count'] }
          ]
        }
      },
      details,
      add: {
        layout: [
          { name: 'meta', fields: ['id:3', 'createdAt:3', 'updatedAt:3', 'status:3'] },
          { name: 'account', fields: ['username:4', 'email:4', 'password:4', 'firstName:6', 'lastName:6'] },
          { name: 'address', fields: ['address1:12', 'address2:12', 'city:6-md 8-sm', 'zipCode:2-md 4-sm', 'provinceState:4-md', 'country:6-md', 'phone:6-md', 'website:12'] },
          { name: 'socialMedia', fields: ['socX:3-md 6-sm', 'socInstagram:3-md 6-sm', 'socFacebook:3-md 6-sm', 'socLinkedIn:3-md 6-sm'] }
        ],
        forceVisible: ['password'],
        hidden: ['id', 'createdAt', 'updatedAt', 'provider']
      },
      edit: merge({}, details, {
        readonly: ['id', 'createdAt', 'updatedAt', 'username', 'provider']
      })
    }
  }
}

export default user
