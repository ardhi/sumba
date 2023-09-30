async function afterInitBajoWebMpa () {
  this.bajoWebMpa.config.i18n.defaultNs.unshift('sumba')
}

export default afterInitBajoWebMpa
