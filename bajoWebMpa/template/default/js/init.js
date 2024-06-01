/* global io, helper */
const sumba = {}
if (io) {
  sumba.socket = io({ path: '/socket.io/' })
  sumba.socket.on('session', data => {
    sumba.session = data
  })
  sumba.socket.on('message', data => {
    // console.log(bufferToObject(data))
  })
  setInterval(() => {
    sumba.socket.emit('time@sys', (new Date()).toISOString())
  }, 1000)
}
