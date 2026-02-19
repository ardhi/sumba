async function country (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'country'
  return {
    properties: [{
      name: opts.fieldName,
      type: 'string',
      maxLength: 2,
      index: opts.index ?? true,
      values: 'sumba:getCountriesValues',
      rules: ['uppercase', { rule: 'length', params: 2 }],
      rulesMsg: { 'any.only': 'validCountryCodeRequired' }
    }],
    rules: [{ rule: 'trim', fields: [opts.fieldName] }]
  }
}

export default country
