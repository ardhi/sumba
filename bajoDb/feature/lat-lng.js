import latLngHook from '../../lib/lat-lng-hook.js'

async function latLng (opts = {}) {
  const { importPkg } = this.bajo.helper
  const { merge } = await importPkg('lodash-es')
  opts.fieldNameLat = opts.fieldNameLat ?? 'lat'
  opts.fieldNameLng = opts.fieldNameLng ?? 'lng'
  opts.scale = opts.scale ?? 5
  opts.precision = opts.precision ?? 8
  return {
    properties: [{
      name: opts.fieldNameLat,
      type: 'float',
      required: opts.required ?? true,
      index: opts.required ?? true,
      precision: opts.precision,
      scale: opts.scale
    }, {
      name: opts.fieldNameLng,
      type: 'float',
      required: opts.required ?? true,
      index: opts.required ?? true,
      precision: opts.precision,
      scale: opts.scale
    }],
    hook: {
      beforeCreate: async function ({ scheme, body }) {
        await latLngHook.call(this, body, merge({}, opts, { lat: opts.fieldNameLat }))
        await latLngHook.call(this, body, merge({}, opts, { lng: opts.fieldNameLng }))
      },
      beforeUpdate: async function ({ scheme, body }) {
        await latLngHook.call(this, body, merge({}, opts, { lat: opts.fieldNameLat }))
        await latLngHook.call(this, body, merge({}, opts, { lng: opts.fieldNameLng }))
      }
    }
  }
}

export default latLng
