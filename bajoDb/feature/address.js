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
      maxLength: 2,
      index: true,
      required: true,
      rules: ['uppercase', { rule: 'length', params: 2 }]
    }, {
      name: 'phone',
      type: 'string',
      maxLength: 50
    }, {
      name: 'website',
      type: 'string',
      maxLength: 100
    }]
  },
  globalRules: [{ rule: 'trim', fields: ['address1', 'address2', 'city', 'zipCode', 'provinceState', 'phone', 'website'] }]
}

export default address
