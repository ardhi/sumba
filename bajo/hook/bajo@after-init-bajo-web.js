async function afterInitWaibu () {
  const { isSet } = this.app.bajo

  if (!isSet(this.app.waibu.config.home)) {
    this.app.waibu.config.home = {
      path: 'sumba:/home',
      forward: true
    }
  }
}

export default afterInitWaibu
