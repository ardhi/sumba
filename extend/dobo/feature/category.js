async function category (opts = {}) {
  return {
    properties: [{
      name: 'name',
      type: 'string',
      maxLength: 50,
      index: true
    }, {
      name: 'level',
      type: 'integer',
      index: true
    }]
  }
}

export default category
