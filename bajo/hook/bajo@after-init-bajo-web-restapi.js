async function afterInitBajoWebRestapi () {
  this.bajoWebRestapi.config.i18n.defaultNs.unshift('sumba')
}

export default afterInitBajoWebRestapi
