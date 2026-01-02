const doboBeforeRecordCreate = {
  level: 1000,
  handler: async function (body, options = {}) {
    const { get, isEmpty } = this.app.lib._
    const user = get(options, 'req.user')
    if (user) {
      if (isEmpty(body.firstName)) body.firstName = user.firstName
      if (isEmpty(body.lastName)) body.lastName = user.firstName
      if (isEmpty(body.email)) body.email = user.email
    }
    if (isEmpty(body.category)) body.category = 'MISC'
    options.checksumId = true
  }
}

export default doboBeforeRecordCreate
