async function navDropdownUser () {
  return class NavDropdownUser extends this.baseFactory {
    build = async () => {
      const { has, omit, find, filter } = this.app.lib._
      const { routePath } = this.app.waibu
      const { req } = this.component
      const icon = this.component.req.iconset ? await this.component.buildTag({ tag: 'icon', attr: { name: 'person' } }) : ''
      let text = ''
      if (has(this.params.attr, 'title')) {
        if (req.user) {
          if (this.params.attr.title === 'short') text = `${req.user.firstName} ${req.user.lastName[0]}.`
          else if (['firstName', 'lastName', 'username'].includes(this.params.attr.title)) text = req.user[this.params.attr.title]
          else text = `${req.user.firstName} ${req.user.lastName}`
        } else text = req.t('guest')
      }
      const html = []
      const attr = omit(this.params.attr, ['text', 'noMenu'])
      attr.dropdown = true
      attr.content = `${icon} ${text}`
      if (this.params.attr.noMenu) {
        delete attr.dropdown
        delete attr.dropdownMenu
        attr.href = routePath(this.component.req.user ? 'sumba:/your-stuff/profile' : 'sumba:/signin')
      } else {
        const menu = find(this.app.sumba.config.waibuMpa.menuHandler, { title: 'account' })
        if (menu) {
          const items = filter(menu.children, c => {
            if (!has(c, 'visible')) return true
            return c.visible === (req.user ? 'auth' : 'anon')
          })
          for (const item of items) {
            if (item.title === 'yourProfile') {
              if (this.params.attr.fancyProfile) {
                const replacer = 'sumba.asset:/user-profile.png'
                const profile = await this.component.buildSentence(`
                  <div>
                    <c:dropdown-item href="${item.href}">
                      <c:img src="dobo:/attachment/SumbaUser/${req.user.id}/profile/main.png?notfound=${replacer}" responsive rounded />
                      <c:div margin="top-1" text="align:center">${req.user.firstName} ${req.user.lastName}</c:div>
                    </c:dropdown-item>
                  </div>
                `)
                html.push(profile)
              } else {
                html.push(await this.component.buildTag({ tag: 'dropdownItem', attr: { href: routePath(item.href) }, html: this.component.req.t(item.title) }))
              }
            } else if (item.title === '-') {
              html.push(await this.component.buildTag({ tag: 'dropdownItem', attr: { divider: true } }))
            } else {
              html.push(await this.component.buildTag({ tag: 'dropdownItem', attr: { href: routePath(item.href) }, html: this.component.req.t(item.title) }))
            }
          }
        }
      }
      this.params.noTag = true
      this.params.html = await this.component.buildTag({ tag: 'navItem', attr, html: html.join('\n'), noEscape: true })
    }
  }
}

export default navDropdownUser
