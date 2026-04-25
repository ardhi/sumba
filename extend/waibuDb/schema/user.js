async function user ({ req } = {}) {
  return {
    common: {
      layout: [
        { name: 'meta', fields: ['id:3', 'createdAt:3', 'updatedAt:3', 'status:3'] },
        { name: 'account', fields: ['username:3', 'email:3', 'provider:3', 'password:3', 'firstName:3', 'lastName:3', 'token:6'] },
        { name: 'address', fields: ['address1:12', 'address2:12', 'city:6-md 8-sm', 'zipCode:2-md 4-sm', 'provinceState:4-md', 'country:6-md', 'phone:6-md', 'website:12'] },
        { name: 'socialMedia', fields: ['socX:3-md 6-sm', 'socInstagram:3-md 6-sm', 'socFacebook:3-md 6-sm', 'socLinkedIn:3-md 6-sm'] }
      ],
      widget: {
        token: {
          component: 'form-plaintext'
        }
      }
    },
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
      details: {
        forceVisible: ['password', 'token'],
        widget: {
          password: {
            component: 'form-plaintext',
            attr: {
              href: 'waibuAdmin:/site/reset-user-password?username={username}',
              value: req.t('resetPassword')
            }
          }
        }
      },
      add: {
        forceVisible: ['password'],
        hidden: ['id', 'createdAt', 'updatedAt', 'provider']
      },
      edit: {
        forceVisible: ['password', 'token'],
        widget: {
          password: {
            component: 'form-plaintext',
            attr: {
              href: 'waibuAdmin:/site/reset-user-password?username={username}',
              value: req.t('resetPassword')
            }
          }
        },
        readonly: ['id', 'createdAt', 'updatedAt', 'username', 'provider']
      }
    }
  }
}

export default user
