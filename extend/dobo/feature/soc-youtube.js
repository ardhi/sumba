async function socYoutube (opts = {}) {
  return {
    properties: [{
      name: 'socYoutube',
      type: 'string',
      maxLength: opts.maxLength ?? 255
    }]
  }
}

export default socYoutube
