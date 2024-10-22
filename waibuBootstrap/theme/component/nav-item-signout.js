async function navItemSignout (params = {}) {
  if (!this.req.user) return
  const { generateId } = this.plugin.app.bajo
  const { routePath } = this.plugin.app.waibu
  params.attr.id = generateId('alpha')
  params.attr['x-data'] = `{
    async signout () {
      await wbs.confirmation(\`${this.req.t('signoutWarning')}\`, { ok: '${params.attr.id}:post', close: 'y' })
    },
    post () {
      wmpa.postForm({}, '${routePath('sumba:/signout')}')
    }
  }`
  params.attr['@click'] = 'signout'
  const icon = await this.buildTag({ tag: 'icon', attr: { name: 'signout', style: 'font-size: 1.5rem' } })
  params.noTag = true
  params.html = await this.buildTag({ tag: 'navItem', attr: params.attr, html: icon })
}

export default navItemSignout
