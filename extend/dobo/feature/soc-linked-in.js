async function socLinkedIn (opts = {}) {
  return {
    properties: [{
      name: 'socLinkedIn',
      type: 'string',
      maxLength: opts.maxLength ?? 255
    }]
  }
}

export default socLinkedIn
