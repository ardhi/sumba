async function address (opts = {}) {
  opts.latLng = opts.latLng ?? true
  const item = {
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
    }, {
      name: 'lat',
      type: 'sumba:lat',
      required: false
    }, {
      name: 'lng',
      type: 'sumba:lng',
      required: false
    }],
    rules: [{
      rule: 'trim',
      fields: ['address1', 'address2', 'city', 'zipCode', 'provinceState', 'phone', 'website']
    }]
  }
  if (opts.latLng) {
    item.properties.push({
      name: 'lat',
      type: 'sumba:lat',
      required: false
    }, {
      name: 'lng',
      type: 'sumba:lng',
      required: false
    })
  }
  return item
}

export default address
