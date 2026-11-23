async function socFacebook (opts = {}) {
  return {
    properties: [{
      name: 'socFacebook',
      type: 'string',
      maxLength: opts.maxLength ?? 255
    }]
  }
}

export default socFacebook
