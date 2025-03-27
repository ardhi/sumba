async function afterBuildLocals (locals, req) {
  const { routePath } = this.app.waibu
  const items = []
  if (req.user) {
    items.push({ icon: 'person', 't:tooltip': 'yourProfile', href: routePath('sumba:/my-stuff/profile') })
    items.push({ icon: 'key', 't:tooltip': 'changePassword', href: routePath('sumba:/my-stuff/change-password') })
    items.push({ component: 'navItemSignout', 't:tooltip': 'signout', bottom: true })
  } else {
    items.push({ icon: 'signin', 't:tooltip': 'signin', href: routePath('sumba:/signin') })
    items.push({ icon: 'key', 't:tooltip': 'forgotPassword', href: routePath('sumba:/user/forgot-password') })
    items.push({ icon: 'personAdd', 't:tooltip': 'newUserSignup', href: routePath('sumba:/user/signup') })
  }
  items.push({ icon: 'envelope', 't:tooltip': 'contactForm', href: routePath('sumba:/help/contact-form') })
  items.push({ icon: 'chat', 't:tooltip': 'troubleTickets', href: routePath('sumba:/help/trouble-tickets') })
  for (const item of items) {
    if (locals._meta.url.startsWith(item.href)) item.active = true
  }
  locals.sidebar = items
}

export default afterBuildLocals
