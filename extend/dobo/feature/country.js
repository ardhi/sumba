async function country (opts = {}) {
  opts.field = opts.field ?? 'country'
  opts.enforceRule = opts.enforceRule ?? true
  opts.required = opts.required ?? true
  if (!opts.enforceRule) opts.required = false
  return {
    properties: [{
      name: opts.field,
      type: 'string',
      maxLength: 2,
      index: opts.index ?? true,
      required: opts.required,
      values: 'sumba:getCountriesValues',
      rules: opts.enforceRule ? ['uppercase', { rule: 'length', params: 2 }] : [],
      rulesMsg: opts.enforceRule ? { 'any.only': 'validCountryCodeRequired' } : undefined
    }],
    rules: [{ rule: 'trim', fields: [opts.field] }]
  }
}

export default country
