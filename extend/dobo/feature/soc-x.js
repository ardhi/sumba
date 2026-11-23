async function socX (opts = {}) {
  return {
    properties: [{
      name: 'socX',
      type: 'string',
      maxLength: opts.maxLength ?? 255
    }]
  }
}

export default socX
