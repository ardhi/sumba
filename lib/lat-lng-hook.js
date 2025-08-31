async function hook (body, options) {
  const { isSet } = this.app.lib.aneka
  const { round } = this.app.lib.aneka
  if (!isSet(body[options.fieldName])) return
  body[options.fieldName] = round(body[options.fieldName], options.scale)
}

export default hook
