async function site (req = {}) {
  const isInterSite = (req.url ?? '').includes('/_is_/')
  let details
  let edit
  if (!isInterSite) {
    details = {
      control: {
        noBackBtn: true,
        noCloneBtn: true,
        editHref: 'waibuAdmin:/site/site?edit=true'
      }
    }
    edit = {
      control: {
        noBackBtn: true,
        noCloneBtn: true,
        detailsHref: 'waibuAdmin:/site/site'
      },
      readonly: ['id', 'createdAt', 'updatedAt']
    }
  }
  const result = {
    common: {
      attachment: true,
      layout: [
        { name: 'meta', fields: ['id', 'createdAt', 'updatedAt'] },
        { name: 'general', fields: ['hostname', 'alias', 'title', 'orgName', 'email', 'status:4-md 6-sm'] },
        { name: 'personInCharge', fields: ['picName:3-md 6-sm:Name', 'picRole:3-md 6-sm:Role', 'picPhone:3-md 6-sm:Phone', 'picEmail:3-md 6-sm:Email'] },
        { name: 'address', fields: ['address1:12', 'address2:12', 'city:6-md 8-sm', 'zipCode:2-md 4-sm', 'provinceState:4-md', 'country:6-md', 'phone:6-md', 'website:12'] },
        { name: 'socialMedia', fields: ['socX:3-md 6-sm', 'socInstagram:3-md 6-sm', 'socFacebook:3-md 6-sm', 'socLinkedIn:3-md 6-sm'] }
      ],
      widget: {
        country: {
          component: 'form-select-ext'
        }
      }
    },
    view: {
      details,
      edit
    }
  }
  return result
}

export default site
