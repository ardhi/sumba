async function teamUser () {
  return {
    common: {
      layout: [
        { name: 'meta', fields: ['id', 'teamId', 'createdAt', 'updatedAt'] },
        { name: 'general', fields: ['ns', 'key', 'value'] }
      ],
      calcFields: [
        { name: 'team', type: 'string' }
      ],
      formatValue: {
        team: (val, rec) => {
          return rec._ref.team.name
        }
      },
      widget: {
        teamId: {
          component: 'form-select-ext',
          attr: {
            remoteUrl: 'sumba.restapi:/manage/team',
            remoteSearchField: 'name',
            remoteLabelField: 'name',
            remoteApiKey: true,
            ref: 'team:name'
          }
        }
      }
    },
    view: {
      list: {
        fields: ['team', 'ns', 'key', 'value', 'createdAt', 'updatedAt'],
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
