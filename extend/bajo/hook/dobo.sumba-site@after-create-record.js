import { createRefs, getAllFixtures } from '../../../lib/create-new-site.js'

async function afterCreateRecord (body, result, options) {
  const fixtures = await getAllFixtures.call(this, result.data.alias)
  await createRefs.call(this, result.data, fixtures, options)
}

export default afterCreateRecord
