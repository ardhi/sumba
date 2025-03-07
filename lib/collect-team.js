import { collect } from './collect-routes.js'

function handler (item) {
  const { isString } = this.app.bajo.lib._
  for (const k of ['methods', 'teams', 'features']) {
    item[k] = item[k] ?? []
    if (isString(item[k])) item[k] = item[k].split(',')
  }
}

async function collectTeam () {
  const { eachPlugins } = this.app.bajo

  this.teamRoutes = this.teamRoutes ?? []
  this.teamNegRoutes = this.teamNegRoutes ?? []
  const items = []
  if (this.app.waibuStatic) items.push('waibuStatic.asset', 'waibuStatic.virtual', 'waibu-static.asset', 'waibu-static.virtual')
  if (this.app.waibuRestApi) items.push('waibuRestApi', 'waibu-rest-api')
  if (this.app.waibuMpa) items.push('waibuMpa', 'waibu-mpa')
  const pattern = `{${items.join(',')}}@team-routes.*`
  const me = this
  await eachPlugins(async function ({ file, ns, dir }) {
    await collect.call(me, { type: 'team', container: 'Routes', handler, file, ns, dir })
  }, { glob: pattern, prefix: this.name })
}

export default collectTeam
