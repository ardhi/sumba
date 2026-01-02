import latLngHook from '../../../lib/lat-lng-hook.js'

async function lat (opts = {}) {
  opts.fieldName = opts.fieldName ?? 'lat'
  opts.scale = opts.scale ?? 5
  opts.precision = opts.precision ?? 8
  return {
    properties: [{
      name: opts.fieldName,
      type: 'double',
      required: opts.required ?? true,
      index: opts.required ?? true,
      precision: opts.precision,
      scale: opts.scale
    }],
    hook: {
      beforeCreate: async function (body) {
        await latLngHook.call(this, body, opts)
      },
      beforeUpdate: async function (body) {
        await latLngHook.call(this, body, opts)
      }
    }
  }
}

export default lat
