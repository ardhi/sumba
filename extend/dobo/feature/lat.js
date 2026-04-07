import { latLngHook } from '../../../lib/util.js'

async function lat (opts = {}) {
  opts.field = opts.field ?? 'lat'
  opts.scale = opts.scale ?? 5
  opts.precision = opts.precision ?? 8
  return {
    properties: [{
      name: opts.field,
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
