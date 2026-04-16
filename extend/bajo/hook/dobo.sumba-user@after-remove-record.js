import { clearCache } from './dobo.sumba-user@after-update-record.js'

async function afterRemoveRecord (id, rec, options = {}) {
  await clearCache.call(this, id, rec)
}

export default afterRemoveRecord
