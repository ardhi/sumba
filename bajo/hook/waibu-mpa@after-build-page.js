async function waibuMpaAfterBuildPage ({ $, ns }) {
  if (ns !== 'sumba') return
  const items = [
    'waibuHtmx:/htmx/htmx.min.js'
  ]
  $('body').append(`<script>\n${items.join('\n')}\n</script>`)
}

export default waibuMpaAfterBuildPage
