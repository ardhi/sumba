async function ts (opts = {}) {
  opts.field = opts.field ?? 'ts'
  return {
    properties: [{
      name: opts.field ?? 'ts',
      type: 'timestamp',
      required: opts.required ?? true,
      index: opts.index ?? true
    }]
  }
}

export default ts
