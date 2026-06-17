async function siteSetting () {
  return {
    common: {
      widget: {
        siteId: {
          attr: {
            url: 'sumba.restapi:/manage/site'
          }
        }
      }
    }
  }
}

export default siteSetting
