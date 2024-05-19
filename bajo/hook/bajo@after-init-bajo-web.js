async function afterInitBajoWebMpa () {
  const { isSet } = this.bajo.helper
  if (!isSet(this.bajoWeb.config.home)) {
    this.bajoWeb.config.home = {
      path: 'sumba:/home',
      forward: true
    }
  }
}

export default afterInitBajoWebMpa
