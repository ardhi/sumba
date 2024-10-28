async function afterBuildLocals (locals, req) {
  const { routePath } = this.app.waibu
  const items = []
  if (req.user) {
    items.push({ icon: 'person', tooltip: 'Your Profile', href: routePath('sumba:/my-stuff/profile') })
    items.push({ icon: 'key', tooltip: 'Change Password', href: routePath('sumba:/my-stuff/change-password') })
    items.push({ component: 'navItemSignout', tooltip: 'Signout', bottom: true })
  } else {
    items.push({ icon: 'signin', tooltip: 'Signin', href: routePath('sumba:/signin') })
    items.push({ icon: 'key', tooltip: 'Forgot Password', href: routePath('sumba:/user/forgot-password') })
    items.push({ icon: 'person', tooltip: 'New User Signup', href: routePath('sumba:/user/signup') })
  }
  for (const item of items) {
    if (locals._meta.url.startsWith(item.href)) item.active = true
  }
  locals.sidebar = items
}

export default afterBuildLocals
