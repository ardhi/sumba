import { removeRefs } from '../../../lib/remove-site.js'
import { clearCache } from './dobo.sumba-site@after-update-record.js'

async function afterRemoveRecord (id, result, options) {
  await removeRefs.call(this, result.oldData, options)
  await clearCache.call(this, id, result)
}

export default afterRemoveRecord
