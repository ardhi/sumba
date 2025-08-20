async function afterCreateContext (ctx) {
  ctx.decorateRequest('user', null)
}

export default afterCreateContext
