async function social (opts = {}) {
  return {
    properties: [{
      name: 'twitter',
      type: 'string',
      maxLength: 50
    }, {
      name: 'instagram',
      type: 'string',
      maxLength: 50
    }, {
      name: 'facebook',
      type: 'string',
      maxLength: 50
    }, {
      name: 'linkedIn',
      type: 'string',
      maxLength: 50
    }]
  }
}

export default social
