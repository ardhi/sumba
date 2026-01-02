async function ts (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'ts'
  return {
    properties: [{
      name: opts.fieldName ?? 'ts',
      type: 'timestamp',
      required: opts.required ?? true,
      index: opts.index ?? true
    }]
  }
}

export default ts
