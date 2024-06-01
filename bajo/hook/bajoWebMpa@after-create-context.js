import setupSession from '../../lib/session/setup.js'

async function afterCreateContext (ctx) {
  await setupSession.call(this, ctx)
}

export default afterCreateContext
