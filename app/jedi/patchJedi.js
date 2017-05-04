const patchHelper = require('utils/patch/patchHelper')

/**
 * Patch department
 */
module.exports = function (req, res, next){

  const schema = {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      history: {
        type: 'array',
        items: {
          type: 'object',
          required: ['event'],
          properties: {
            episode: { type: 'number' },
            event: { type: 'string' }
          }
        }
      }
    }
  }
  
  patchHelper.handlePatch(req.db.jedi, req.params.id, req.body, schema, res, next)

}
