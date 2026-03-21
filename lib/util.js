export function parseNsSettings (ns, setting, items) {
  const { trim, set, isPlainObject, isArray, isEmpty } = this.app.lib._
  const { parseObject, dayjs } = this.app.lib

  for (const item of items) {
    let value = trim([item.value] ?? '')
    if (['[', '{'].includes(value[0])) {
      try {
        value = parseObject(JSON.parse(value))
      } catch (err) {}
    } else if (Number(value)) value = Number(value)
    else if (['true', 'false'].includes(value)) value = value === 'true'
    else if (item.key.endsWith('$in')) value = value.split(',').map(v => v.trim())
    else {
      const dt = dayjs(value)
      if (dt.isValid()) value = dt.toDate()
    }
    if ((isPlainObject(value) || isArray(value)) && isEmpty(value)) continue
    set(setting, `${ns}.${item.key}`, value)
  }
}
