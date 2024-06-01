async function afterAllScriptCollect (scripts) {
  const { routePath } = this.bajoWeb.helper
  scripts.push(routePath('sumba:/js/init.js'))
}

export default afterAllScriptCollect
