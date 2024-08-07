async function afterInitWaibuMpa () {
  this.app.waibuMpa.config.i18n.defaultNs.unshift('sumba')
}

export default afterInitWaibuMpa
