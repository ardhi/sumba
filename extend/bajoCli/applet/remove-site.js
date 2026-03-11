async function removeSite (path, ...args) {
  const { importPkg } = this.app.bajo
  const { removeSite } = this.app.sumba
  const confirm = await importPkg('bajoCli:@inquirer/confirm')
  const [alias] = args
  const answer = await confirm({ message: this.print.buildText('aboutToDeleteSite%s', alias), default: false })
  if (!answer) {
    this.print.fail('aborted')
    this.app.exit()
  }
  await this.app.dobo.start()
  try {
    await removeSite(alias, true)
  } catch (err) {
    this.print.fatal(err.message)
  }
  this.app.exit()
}

export default removeSite
