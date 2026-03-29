import { removeRefs } from '../../../lib/remove-site.js'

async function afterRemoveRecord (id, result, options) {
  await removeRefs.call(this, result.oldData, options)
}

export default afterRemoveRecord
