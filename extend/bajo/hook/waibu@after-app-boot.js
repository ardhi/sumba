async function afterAppBoot () {
  await this.getRouteGuards(true)
  await this.getModelGuards(true)
  await this.getAttribGuards(true)
}

export default afterAppBoot
