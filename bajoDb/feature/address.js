const address = {
  addProps: async function (opts) {
    if (!opts) return
    return [{
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
      type: 'string',
      maxLength: 20,
      index: true,
      required: true
    }, {
      name: 'phone',
      type: 'string',
      maxLength: 50
    }, {
      name: 'website',
      type: 'string',
      maxLength: 100
    }]
  }
}

export default address
