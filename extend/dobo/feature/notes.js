async function notes (opts = {}) {
  opts.field = opts.field ?? 'notes'
  return {
    properties: [{
      name: opts.field,
      type: 'text'
    }]
  }
}

export default notes
