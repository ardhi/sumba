async function afterBuildPagesMenu (pages, req) {
  if (!this.config.license) return
  const { find } = this.lib._
  const item = find(pages, { title: 'help' })
  if (!item) return
  item.children.push(
    { title: '-' },
    { title: 'license', href: 'sumba:/info/license' }
  )
}

export default afterBuildPagesMenu
