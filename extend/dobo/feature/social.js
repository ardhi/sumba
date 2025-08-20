async function social (opts = {}) {
  return {
    properties: [{
      name: 'socX',
      type: 'string',
      maxLength: 50
    }, {
      name: 'socInstagram',
      type: 'string',
      maxLength: 50
    }, {
      name: 'socFacebook',
      type: 'string',
      maxLength: 50
    }, {
      name: 'socLinkedIn',
      type: 'string',
      maxLength: 50
    }]
  }
}

export default social
