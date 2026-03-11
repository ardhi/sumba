async function createSite (path, ...args) {
  const { createNewSite } = this.app.sumba
  const { importPkg } = this.app.bajo
  const confirm = await importPkg('bajoCli:@inquirer/confirm')
  const [alias, hostname] = args
  if (!alias) this.print.fatal('aliasRequired')
  const answer = await confirm({ message: this.print.buildText('aboutToCreateSite%s', alias), default: false })
  if (!answer) {
    this.print.fail('aborted')
    this.app.exit()
  }
  await this.app.dobo.start()
  try {
    await createNewSite(alias, hostname, true)
  } catch (err) {
    this.print.fatal(err.message)
  }
  this.app.exit()
}

export default createSite
