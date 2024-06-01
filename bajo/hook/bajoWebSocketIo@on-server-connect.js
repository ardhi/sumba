async function onServerConnect (socket) {
  socket.emit('session', socket.session)
}

export default onServerConnect
