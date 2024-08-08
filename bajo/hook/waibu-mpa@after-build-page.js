async function waibuMpaAfterBuildPage ({ $, ns }) {
  if (ns !== 'sumba') return
  const { routePath } = this.app.waibu
  let items = []
  if (this.app.waibuHtmx) items.push(routePath('waibuHtmx.virtual:/htmx/htmx.min.js'))
  items = items.map(item => {
    return `<script src="${item}"></script>`
  })
  if (items.length > 0) $('body').append(items.join('\n'))
}

export default waibuMpaAfterBuildPage
