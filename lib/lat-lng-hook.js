async function hook (body, options) {
  const { round, isSet } = this.bajo.helper
  if (!isSet(body[options.fieldName])) return
  body[options.fieldName] = round(body[options.fieldName], options.scale)
}

export default hook
