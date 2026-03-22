import { checkNoRouteSetting, checkNoRouteSettingKey } from '../../../lib/util.js'

const preParsing = {
  level: 10,
  handler: async function (req, reply) {
    const { get } = this.app.lib._
    req.site = await this.getSite(req)
    const routes = get(req.site, checkNoRouteSettingKey)
    checkNoRouteSetting.call(this, req, routes)
  }
}

export default preParsing
