async function teamUser () {
  return {
    common: {
      hidden: ['siteId'],
      layout: [
        { name: 'meta', fields: ['id', 'createdAt', 'updatedAt'] },
        { name: 'general', fields: ['userId:6-md', 'teamId:6-md'] }
      ]
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
