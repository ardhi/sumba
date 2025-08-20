async function download () {
  return {
    common: {
      disabled: ['create', 'update', 'get'],
      formatter: {
        description: async function (val, rec) {
          const sentence = `<c:a target="_blank" href="sumba:/your-stuff/download/get/${rec.file}" content="${val}" @click.stop />`
          return await this.component.buildSentence(sentence)
        },
        size: function (val, rec) {
          const { formatByte } = this.plugin.app.bajoExtra
          return formatByte(rec.size)
        }
      }
    },
    view: {
      list: {
        fields: ['description', 'type', 'size', 'status', 'updatedAt'],
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
