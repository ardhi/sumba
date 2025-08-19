async function teamUser () {
  return {
    common: {
      layout: [
        { name: 'meta', fields: ['id', 'createdAt', 'updatedAt'] },
        { name: 'general', fields: ['userId:6-md', 'teamId:6-md'] }
      ],
      widget: {
        userId: {
          component: 'form-select-ext',
          attr: {
            remoteUrl: 'sumba.restapi:/manage/user',
            remoteSearchField: 'username',
            remoteLabelField: 'username',
            remoteApiKey: true
          }
        },
        teamId: {
          component: 'form-select-ext',
          attr: {
            remoteUrl: 'sumba.restapi:/manage/team',
            remoteSearchField: 'name',
            remoteLabelField: 'name',
            remoteApiKey: true
          }
        }
      }
    },
    view: {
      list: {
        fields: ['userId', 'teamId', 'createdAt', 'updatedAt'],
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
