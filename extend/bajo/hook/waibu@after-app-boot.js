async function afterAppBoot () {
  await this.getRouteGuards(true)
}

export default afterAppBoot
