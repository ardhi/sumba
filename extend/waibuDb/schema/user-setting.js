async function teamUser ({ req } = {}) {
  return {
    common: {
      layout: [
        { name: 'meta', fields: ['id', 'userId', 'createdAt', 'updatedAt'] },
        { name: 'general', fields: ['ns', 'key', 'value'] }
      ],
      calcFields: [
        { name: 'user', type: 'string' }
      ],
      formatValue: {
        user: (val, rec) => {
          return rec._ref.user.name
        }
      },
      widget: {
        userId: {
          component: 'form-select-ext',
          attr: {
            remoteUrl: 'sumba.restapi:/manage/user',
            remoteSearchField: 'name',
            remoteLabelField: 'name',
            remoteApiKey: true,
            ref: 'user:name'
          }
        }
      }
    },
    view: {
      list: {
        fields: ['user', 'ns', 'key', 'value', 'createdAt', 'updatedAt'],
        stat: {
          aggregate: [
            { fields: ['userId'], group: 'userId', aggregate: ['count'] },
            { fields: ['teamId'], group: 'teamId', aggregate: ['count'] }
          ]
        }
      },
      details: {
      },
      add: {
        hidden: ['id', 'createdAt', 'updatedAt']
      },
      edit: {
        readonly: ['id', 'createdAt', 'updatedAt']
      }
    }
  }
}

export default teamUser
