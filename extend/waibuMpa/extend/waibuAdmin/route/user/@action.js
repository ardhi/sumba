const action = {
  method: ['GET', 'POST'],
  title: 'userProfile',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const crudSkel = await importModule('waibuAdmin:/lib/crud-skel.js')
    const options = { modelOpts: { forceNoHidden: ['token'] } }
    return await crudSkel.call(this, 'SumbaUser', req, reply, { options })
  }
}

export default action
