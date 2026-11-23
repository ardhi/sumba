async function socInstagram (opts = {}) {
  return {
    properties: [{
      name: 'socInstagram',
      type: 'string',
      maxLength: opts.maxLength ?? 255
    }]
  }
}

export default socInstagram
