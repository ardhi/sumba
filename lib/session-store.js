import { EventEmitter } from 'events'
import util from 'util'

function SessionStore (options = {}) {
  this.scope = options.scope
  this.repo = 'SumbaSession'
  EventEmitter.call(this)
}

util.inherits(SessionStore, EventEmitter)

SessionStore.prototype.set = function set (sessionId, session, callback) {
  const { log } = this.scope.bajo.helper
  const { recordGet, recordCreate, recordUpdate } = this.scope.bajoDb.helper
  const sess = JSON.stringify(session)
  recordGet(this.repo, sessionId, { thrownNotFound: false })
    .then(item => {
      if (!item) return recordCreate(this.repo, { id: sessionId, session: sess }, { skipHook: true })
      return recordUpdate(this.repo, sessionId, { session: sess }, { skipHook: true })
    })
    .then(item => {
      callback()
    })
    .catch(err => {
      log.error('Session error: %s', err.message)
      callback()
    })
}

SessionStore.prototype.get = function get (sessionId, callback) {
  const { log } = this.scope.bajo.helper
  const { recordGet } = this.scope.bajoDb.helper
  recordGet(this.repo, sessionId, { skipHook: true })
    .then(item => {
      callback(null, JSON.parse(item.session))
    })
    .catch(err => {
      log.error('Session error: %s', err.message)
      callback()
    })
}

SessionStore.prototype.destroy = function destroy (sessionId, callback) {
  const { log } = this.scope.bajo.helper
  const { recordRemove } = this.scope.bajoDb.helper
  recordRemove(this.repo, sessionId, { skipHook: true })
    .then(item => {
      callback()
    })
    .catch(err => {
      log.error('Session error: %s', err.message)
      callback()
    })
}

export default SessionStore
