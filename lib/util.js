export function parseNsSettings (ns, setting, items) {
  const { trim, set, isPlainObject, isArray, isEmpty, find } = this.app.lib._
  const { parseObject, dayjs } = this.app.lib

  for (const item of items) {
    if (item.ns === '_var' || ns === '_var') continue
    let value = trim([item.value] ?? '')
    if (value[0] === '#' && value[value.length - 1] === '#') {
      const val = value.slice(1, -1)
      const newValue = find(items, { ns: '_var', key: val })
      if (newValue) value = newValue.value
    }
    if (['[', '{'].includes(value[0]) && [']', '}'].includes(value[value.length - 1])) {
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
