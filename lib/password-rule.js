import { joiPasswordExtendCore } from 'joi-password'

async function passwordRule (req) {
  const { importPkg } = this.app.bajo
  const joi = await importPkg('dobo:joi')
  const joiPassword = joi.extend(joiPasswordExtendCore)
  let password = joiPassword
    .string()
    .min(8)
    .max(100)
    .required()
  const cfg = req ? req.site.setting.sumba.userPassword : this.config.siteSetting
  if (cfg.minUppercase) password = password.minOfUppercase(cfg.minUppercase)
  if (cfg.minLowercase) password = password.minOfLowercase(cfg.minLowercase)
  if (cfg.minSpecialChar) password = password.minOfSpecialCharacters(cfg.minSpecialChar)
  if (cfg.minNumeric) password = password.minOfNumeric(cfg.minNumeric)
  if (cfg.noWhitespace) password = password.noWhiteSpaces()
  if (cfg.latinOnlyChars) password = password.onlyLatinCharacters()
  return password
}

export default passwordRule
