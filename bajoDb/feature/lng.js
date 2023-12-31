async function lng (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'lng'
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

export default lng
