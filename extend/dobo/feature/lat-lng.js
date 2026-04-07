import { latLngHook } from '../../../lib/util.js'

async function latLng (opts = {}) {
  const { merge } = this.app.lib._
  opts.fieldLat = opts.fieldLat ?? 'lat'
  opts.fieldLng = opts.fieldLng ?? 'lng'
  opts.scale = opts.scale ?? 5
  opts.precision = opts.precision ?? 8
  return {
    properties: [{
      name: opts.fieldLat,
      type: 'double',
      required: opts.required ?? true,
      index: opts.required ?? true,
      precision: opts.precision,
      scale: opts.scale
    }, {
      name: opts.fieldLng,
      type: 'double',
      required: opts.required ?? true,
      index: opts.required ?? true,
      precision: opts.precision,
      scale: opts.scale
    }],
    hook: {
      beforeCreate: async function (body) {
        await latLngHook.call(this, body, merge({}, opts, { lat: opts.fieldLat }))
        await latLngHook.call(this, body, merge({}, opts, { lng: opts.fieldLng }))
      },
      beforeUpdate: async function (body) {
        await latLngHook.call(this, body, merge({}, opts, { lat: opts.fieldLat }))
        await latLngHook.call(this, body, merge({}, opts, { lng: opts.fieldLng }))
      }
    }
  }
}

export default latLng
