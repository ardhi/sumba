async function lat (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'lat'
  return {
    properties: [{
      name: opts.fieldName,
      type: 'float',
      required: opts.required ?? true,
      index: opts.required ?? true
    }]
  }
}

export default lat
