const contactForm = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.bajo
    const { pick } = this.app.bajo.lib._
    const { recordCreate } = this.app.waibuDb

    const def = req.user ? pick(req.user, ['firstName', 'lastName', 'email']) : {}
    const form = defaultsDeep(req.body, def)
    let error
    if (req.method === 'POST') {
      try {
        const { data } = await recordCreate({ model: 'SumbaContactForm', req, reply, options: { noFlash: true } })
        req.flash('notify', 'Contact form successfully submitted')
        return reply.view('sumba.template:/help/contact-form/success.html', { form: req.body, data })
      } catch (err) {
        error = err
      }
    }
    return reply.view('sumba.template:/help/contact-form/form.html', { form, error })
  }
}

export default contactForm
