async function personInCharge (opts = {}) {
  return {
    properties: [{
      name: 'picName',
      type: 'string',
      maxLength: 50,
      index: true
    }, {
      name: 'picRole',
      type: 'string',
      maxLength: 50,
      index: true
    }, {
      name: 'picPhone',
      type: 'sumba:phone'
    }, {
      name: 'picEmail',
      type: 'sumba:email'
    }]
  }
}

export default personInCharge
