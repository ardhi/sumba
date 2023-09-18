async function bajoWebBuildLocals (value, req) {
  const { print } = this.bajo.helper
  const { routePath } = this.bajoWeb.helper
  const _meta = value._meta
  if (_meta.user) {
    _meta.menuUser = [
      { value: routePath('sumba:/change-password', req), text: print.__('Change Password') },
      { value: routePath('sumba:/profile', req), text: print.__('My Profile') },
      '-',
      { value: routePath('sumba:/signout', req), text: print.__('Signout') }
    ]
  } else {
    _meta.menuUser = [
      { value: routePath('sumba:/signin', req), text: print.__('Signin') },
      '-',
      { value: routePath('sumba:/signup', req), text: print.__('Signup') },
      { value: routePath('sumba:/forgot-password', req), text: print.__('Forgot Password') }
    ]
  }
}

export default bajoWebBuildLocals
