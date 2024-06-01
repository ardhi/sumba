import { EventEmitter } from 'events'
import util from 'util'

function Store (options = {}) {
  this.scope = options.scope
  this.coll = 'SumbaSession'
  EventEmitter.call(this)
}

util.inherits(Store, EventEmitter)
const opts = { noHook: true, noCache: true, noValidation: true, dataOnly: true }

Store.prototype.set = function (sessionId, session, callback) {
  const { log } = this.scope.bajo.helper
  const { recordGet, recordCreate, recordUpdate } = this.scope.bajoDb.helper
  const sess = JSON.stringify(session)
  recordGet(this.coll, sessionId, { thrownNotFound: false })
    .then(item => {
      if (!item) return recordCreate(this.coll, { id: sessionId, session: sess }, opts)
      return recordUpdate(this.coll, sessionId, { session: sess }, opts)
    })
    .then(item => {
      callback()
    })
    .catch(err => {
      log.error('Session error: [%s] %s', 'SET', err.message)
      callback()
    })
}

Store.prototype.get = function (sessionId, callback) {
  const { log } = this.scope.bajo.helper
  const { recordGet } = this.scope.bajoDb.helper
  recordGet(this.coll, sessionId, opts)
    .then(item => {
      callback(null, JSON.parse(item.session))
    })
    .catch(err => {
      log.error('Session error: [%s] %s', 'GET', err.message)
      callback()
    })
}

Store.prototype.destroy = function (sessionId, callback) {
  const { log } = this.scope.bajo.helper
  const { recordRemove } = this.scope.bajoDb.helper
  recordRemove(this.coll, sessionId, opts)
    .then(item => {
      callback()
    })
    .catch(err => {
      log.error('Session error: [%s] %s', 'DESTROY', err.message)
      callback()
    })
}

// TODO: clear expired sessions
Store.prototype.clearExpired = function (callback) {
}

export default Store
