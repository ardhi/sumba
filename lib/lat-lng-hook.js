async function hook (body, options) {
  const { isSet } = this.lib.aneka
  const { round } = this.lib.aneka
  if (!isSet(body[options.fieldName])) return
  body[options.fieldName] = round(body[options.fieldName], options.scale)
}

export default hook
