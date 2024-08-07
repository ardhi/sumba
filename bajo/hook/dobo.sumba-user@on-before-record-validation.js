import { joiPasswordExtendCore } from 'joi-password'

async function doboSumbaUserOnBeforeRecordValidation (body, options = {}) {
  const { importPkg } = this.app.bajo
  const { set } = this.app.bajo.lib._

  const joi = await importPkg('dobo:joi')
  const joiPassword = joi.extend(joiPasswordExtendCore)
  let password = joiPassword
    .string()
    .min(8)
    .max(100)
    .required()
  if (this.config.userPassword.minUppercase) password = password.minOfUppercase(this.config.userPassword.minUppercase)
  if (this.config.userPassword.minLowercase) password = password.minOfLowercase(this.config.userPassword.minLowercase)
  if (this.config.userPassword.minSpecialChar) password = password.minOfSpecialCharacters(this.config.userPassword.minSpecialChar)
  if (this.config.userPassword.minNumeric) password = password.minOfNumeric(this.config.userPassword.minNumeric)
  if (this.config.userPassword.noWhitespace) password = password.noWhiteSpaces()
  if (this.config.userPassword.latinOnlyChars) password = password.onlyLatinCharacters()

  const rule = { password }
  set(options, 'validation.params.rule', rule)
}

export default doboSumbaUserOnBeforeRecordValidation
