async function download () {
  return {
    common: {
      disabled: ['create', 'update', 'get'],
      format: {
        download: async function (val, rec, { req } = {}) {
          let sentence = req.t(val)
          if (rec.status === 'COMPLETE') sentence = `<c:btn size="sm" icon="download" color="primary" href="sumba:/your-stuff/download/get/${rec.id}" content="${val}" @click.stop />`
          return await this.component.buildSentence(sentence)
        },
        type: async function (val, rec, { req } = {}) {
          const { camelCase } = this.app.lib._
          return req.t(camelCase(`file ${val}`))
        },
        size: function (val, rec) {
          const { formatByte } = this.app.bajoExtra
          return formatByte(rec.size)
        }
      }
    },
    view: {
      list: {
        fields: ['description', 'type', 'size', 'status', 'updatedAt', 'download'],
        stat: {
          aggregate: [
            { fields: ['type'], group: 'type', aggregate: ['count'] },
            { fields: ['status'], group: 'status', aggregate: ['count'] }
          ]
        }
      }
    }
  }
}

export default download
