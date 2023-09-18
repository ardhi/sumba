import { joiPasswordExtendCore } from 'joi-password'

async function bajoDbSiteUserOnBeforeRecordValidation (body, options) {
  const { importPkg, getConfig } = this.bajo.helper
  const joi = await importPkg('bajo-db:joi')
  const cfg = getConfig('sumba')
  const joiPassword = joi.extend(joiPasswordExtendCore)
  let password = joiPassword
    .string()
    .min(8)
    .max(50)
    .required()
  if (cfg.userPassword.minUppercase) password = password.minOfUppercase(cfg.userPassword.minUppercase)
  if (cfg.userPassword.minLowercase) password = password.minOfLowercase(cfg.userPassword.minLowercase)
  if (cfg.userPassword.minSpecialChar) password = password.minOfSpecialCharacters(cfg.userPassword.minSpecialChar)
  if (cfg.userPassword.minNumeric) password = password.minOfNumeric(cfg.userPassword.minNumeric)
  if (cfg.userPassword.noWhitespace) password = password.noWhiteSpaces()
  if (cfg.userPassword.latinOnlyChars) password = password.onlyLatinCharacters()

  const rule = { password }
  options.validation = { rule, ns: ['sumba', 'bajoDb'] }
}

export default bajoDbSiteUserOnBeforeRecordValidation
