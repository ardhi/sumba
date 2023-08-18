const boot = {
  level: 10,
  handler: async function () {
    this.bajoWeb.instance.decorateRequest('siteId', 'DEFAULT')
    this.bajoWeb.instance.decorateRequest('userId', '')
  }
}

export default boot
