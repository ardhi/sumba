async function social (opts = {}) {
  return {
    properties: [{
      name: 'socX',
      type: 'sumba:socX'
    }, {
      name: 'socInstagram',
      type: 'sumba:socInstagram'
    }, {
      name: 'socFacebook',
      type: 'sumba:socFacebook'
    }, {
      name: 'socLinkedIn',
      type: 'sumba:socLinkedIn'
    }]
  }
}

export default social
