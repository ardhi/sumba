async function afterCreateContext (ctx) {
  ctx.decorateRequest('site', null)
  ctx.decorateRequest('user', null)
}

export default afterCreateContext
