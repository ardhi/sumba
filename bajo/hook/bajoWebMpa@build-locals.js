async function bajoWebBuildLocals (value, req) {
  const { routePath } = this.bajoWeb.helper
  const _meta = value._meta
  if (_meta.user) {
    _meta.menuUser = [
      { value: routePath('sumba:/change-password', req), text: 'Change Password' },
      { value: routePath('sumba:/profile', req), text: 'Your Profile' },
      '-',
      { value: routePath('sumba:/signout', req), text: 'Signout' }
    ]
  } else {
    _meta.menuUser = [
      { value: routePath('sumba:/signin', req), text: 'Signin' },
      '-',
      { value: routePath('sumba:/signup', req), text: 'Signup' },
      { value: routePath('sumba:/forgot-password', req), text: 'Forgot Password' }
    ]
  }
}

export default bajoWebBuildLocals
