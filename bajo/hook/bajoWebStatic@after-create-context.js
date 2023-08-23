import setupSession from '../../lib/setup-session.js'

async function onAfterCreateContext () {
  await setupSession.call(this, 'bajoWebStatic')
}

export default onAfterCreateContext
