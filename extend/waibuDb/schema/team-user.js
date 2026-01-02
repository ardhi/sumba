async function teamUser () {
  return {
    common: {
      layout: [
        { name: 'meta', fields: ['id', 'createdAt', 'updatedAt'] },
        { name: 'general', fields: ['userId:6-md', 'teamId:6-md'] }
      ],
      calcFields: [
        { name: 'user', type: 'string' },
        { name: 'team', type: 'string' }
      ],
      valueFormatter: {
        user: (val, rec) => {
          return rec._rel.user.username
        },
        team: (val, rec) => {
          return rec._rel.team.name
        }
      },
      widget: {
        userId: {
          component: 'form-select-ext',
          attr: {
            remoteUrl: 'sumba.restapi:/manage/user',
            remoteSearchField: 'username',
            remoteLabelField: 'username',
            remoteApiKey: true,
            rel: 'user:username'
          }
        },
        teamId: {
          component: 'form-select-ext',
          attr: {
            remoteUrl: 'sumba.restapi:/manage/team',
            remoteSearchField: 'name',
            remoteLabelField: 'name',
            remoteApiKey: true,
            rel: 'team:name'
          }
        }
      }
    },
    view: {
      list: {
        fields: ['user', 'team', 'createdAt', 'updatedAt'],
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
