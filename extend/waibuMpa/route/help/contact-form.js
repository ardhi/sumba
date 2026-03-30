const contactForm = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    const { defaultsDeep } = this.app.lib.aneka
    const { pick } = this.app.lib._
    const { createRecord, findAllRecord } = this.app.waibuDb

    const def = req.user ? pick(req.user, ['firstName', 'lastName', 'email']) : {}
    const form = defaultsDeep(req.body, def)
    let error
    if (req.method === 'POST') {
      try {
        const { data } = await createRecord({ model: 'SumbaContactForm', req, reply, transaction: true, options: { noFlash: true } })
        req.flash('notify', req.t('contactFormSubmitted'))
        return await reply.view('sumba.template:/help/contact-form/success.html', { form: req.body, data })
      } catch (err) {
        error = err
      }
    }
    const cats = await findAllRecord({ model: 'SumbaContactFormCat', req, options: { sort: 'level:1+name:1', dataOnly: true } })
    return await reply.view('sumba.template:/help/contact-form/form.html', { form, error, cats })
  }
}

export default contactForm
