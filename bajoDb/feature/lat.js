async function lat (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'lat'
  return {
    properties: [{
      name: opts.fieldName,
      type: 'float',
      required: opts.required ?? true,
      index: opts.required ?? true,
      precision: 8,
      scale: 5
    }]
  }
}

export default lat
