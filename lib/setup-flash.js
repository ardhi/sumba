// Based on https://github.com/fastify/fastify-flash/blob/master/src/flash.ts
import { format } from 'util'

export async function setupReq () {
  const { importPkg, error } = this.bajo.helper
  const { isArray } = await importPkg('lodash-es')
  return function (type, ...message) {
    let sess = this.session.flash
    if (!sess) {
      sess = {}
      this.session.flash = sess
    }
    if (message.length === 0) throw error('Flash message is required')
    if (isArray(message[0])) {
      for (let i = 0; i < message[0].length; i++) {
        sess = {
          ...sess,
          [type]: (sess[type] || []).concat(message[0][i])
        }
      }
    } else {
      sess = {
        ...sess,
        [type]: (sess[type] || []).concat(message.length > 1 ? format.apply(undefined, message) : message[0])
      }
    }
    this.session.flash = sess
    return this.session.flash[type].length
  }
}

export function reply (type) {
  if (!type) {
    const allMessages = this.request.session.flash || {}
    this.request.session.flash = {}
    return allMessages
  }
  const { [type]: messages, ...flash } = this.request.session.flash || {}
  this.request.session.flash = flash
  return messages || []
}
