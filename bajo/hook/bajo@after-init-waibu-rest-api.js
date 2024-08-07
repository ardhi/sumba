async function afterInitWaibuRestApi () {
  this.app.waibuRestApi.config.i18n.defaultNs.unshift('sumba')
}

export default afterInitWaibuRestApi
