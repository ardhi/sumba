async function latLng (opts = {}) {
  opts.fieldNameLat = opts.fieldNameLat ?? 'lat'
  opts.fieldNameLng = opts.fieldNameLng ?? 'lng'
  return {
    properties: [{
      name: opts.fieldNameLat,
      type: 'float',
      required: opts.required ?? true,
      index: opts.required ?? true
    }, {
      name: opts.fieldNameLng,
      type: 'float',
      required: opts.required ?? true,
      index: opts.required ?? true
    }]
  }
}

export default latLng
