async function address (opts = {}) {
  return {
    properties: [{
      name: 'address1',
      type: 'string'
    }, {
      name: 'address2',
      type: 'string'
    }, {
      name: 'city',
      type: 'string',
      maxLength: 50,
      index: true
    }, {
      name: 'zipCode',
      type: 'string',
      maxLength: 10,
      index: true
    }, {
      name: 'provinceState',
      type: 'string',
      maxLength: 50,
      index: true
    }, {
      name: 'country',
      type: 'sumba:country'
    }, {
      name: 'phone',
      type: 'string',
      maxLength: 50
    }, {
      name: 'waPhone',
      type: 'string',
      maxLength: 50
    }, {
      name: 'website',
      type: 'string',
      maxLength: 100
    }],
    rules: [{
      rule: 'trim',
      fields: ['address1', 'address2', 'city', 'zipCode', 'provinceState', 'phone', 'website']
    }]
  }
}

export default address
