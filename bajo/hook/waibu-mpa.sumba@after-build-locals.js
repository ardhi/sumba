async function afterBuildLocals (locals, req) {
  const { routePath } = this.app.waibu
  const items = []
  if (req.user) {
    items.push({ icon: 'person', tooltip: 'yourProfile', href: routePath('sumba:/my-stuff/profile') })
    items.push({ icon: 'key', tooltip: 'changePassword', href: routePath('sumba:/my-stuff/change-password') })
    items.push({ component: 'navItemSignout', tooltip: 'signout', bottom: true })
  } else {
    items.push({ icon: 'signin', tooltip: 'signin', href: routePath('sumba:/signin') })
    items.push({ icon: 'key', tooltip: 'forgotPassword', href: routePath('sumba:/user/forgot-password') })
    items.push({ icon: 'personAdd', tooltip: 'newUserSignup', href: routePath('sumba:/user/signup') })
  }
  for (const item of items) {
    if (locals._meta.url.startsWith(item.href)) item.active = true
  }
  locals.sidebar = items
}

export default afterBuildLocals
