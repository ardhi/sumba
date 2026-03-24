import { checkNoRouteSetting, checkNoRouteSettingKey } from '../../../lib/util.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    const { get } = this.app.lib._
    const { getHostname } = this.app.waibu
    req.site = await this.getSite(getHostname(req))
    const routes = get(req.site, checkNoRouteSettingKey)
    checkNoRouteSetting.call(this, req, routes)
  }
}

export default preParsing
