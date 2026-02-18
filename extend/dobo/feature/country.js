async function country (opts = {}) {
  const { readConfig } = this.app.bajo
  opts.fieldName = opts.fieldName ?? 'country'
  const countries = await readConfig('bajoCommonDb:/extend/dobo/fixture/country.json', { ignoreError: true, defValue: [] })
  const values = countries.map(item => ({ value: item.id, text: item.name.replaceAll('\'', '') }))
  return {
    properties: [{
      name: opts.fieldName,
      type: 'string',
      maxLength: 2,
      index: opts.index ?? true,
      values,
      rules: ['uppercase', { rule: 'length', params: 2 }]
    }],
    rules: [{ rule: 'trim', fields: [opts.fieldName] }]
  }
}

export default country
