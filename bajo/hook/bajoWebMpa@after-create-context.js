import setupSession from '../../lib/setup-session.js'

async function bajoWebMpaAfterCreateContext () {
  await setupSession.call(this, 'bajoWebMpa')
}

export default bajoWebMpaAfterCreateContext
