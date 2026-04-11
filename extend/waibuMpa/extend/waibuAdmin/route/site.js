const manageSite = {
  method: ['GET', 'POST'],
  title: 'siteProfile',
  handler: async function (req, reply) {
    const { importModule } = this.app.bajo
    const detailsHandler = await importModule('waibuDb:/lib/crud/details-handler.js')
    const editHandler = await importModule('waibuDb:/lib/crud/edit-handler.js')
    const action = req.query.edit ? editHandler : detailsHandler
    const template = `waibuDb.template:/crud/${req.query.edit ? 'edit' : 'details'}.html`
    const model = 'SumbaSite'
    req.params.id = req.site.id
    req.query.id = req.site.id
    req.params.base = ''
    const options = {
      modelOpts: {
        formatValue: true,
        retainOriginalValue: true
      },
      schema: {
        view: {
          details: {
            control: {
              wdbBtnBack: {
                disabled: true
              },
              wdbBtnClone: {
                disabled: true
              },
              wdbBtnDelete: {
                disabled: true
              },
              wdbBtnEdit: {
                href: 'waibuAdmin:/site/site?edit=true'
              }
            }
          },
          edit: {
            control: {
              wdbBtnBack: {
                disabled: true
              },
              wdbBtnClone: {
                disabled: true
              },
              wdbBtnDelete: {
                disabled: true
              },
              wdbBtnDetails: {
                href: 'waibuAdmin:/site/site'
              }
            },
            readonly: ['id', 'createdAt', 'updatedAt']
          }
        }
      }
    }

    return await action.call(this, { req, reply, model, template, options })
  }
}

export default manageSite
