async function afterBuildLocals (locals, req) {
  const { routePath } = this.app.waibu
  const items = []
  if (req.user) {
    items.push({ icon: 'person', tooltip: 'Your Profile', href: routePath('sumba:/profile') })
    items.push({ icon: 'key', tooltip: 'Change Password', href: routePath('sumba:/change-password') })
  } else {
    items.push({ icon: 'signin', tooltip: 'Signin', href: routePath('sumba:/signin') })
    items.push({ icon: 'key', tooltip: 'Forgot Password', href: routePath('sumba:/forgot-password') })
    items.push({ icon: 'person', tooltip: 'New User Signup', href: routePath('sumba:/signup') })
  }
  for (const item of items) {
    if (locals._meta.url.startsWith(item.href)) item.active = true
  }
  locals.sidebar = items
}

export default afterBuildLocals
