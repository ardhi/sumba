import { collect } from './collect-routes.js'

function handler (item) {
  const { isString } = this.lib._
  for (const k of ['methods', 'teams', 'features']) {
    item[k] = item[k] ?? []
    if (isString(item[k])) item[k] = item[k].split(',')
  }
}

async function collectTeam () {
  const { eachPlugins } = this.app.bajo
  const me = this
  await eachPlugins(async function ({ file, ns, dir }) {
    await collect.call(me, { type: 'team', container: 'Routes', handler, file, ns, dir })
  }, { glob: 'route/team.*', prefix: this.name })
}

export default collectTeam
