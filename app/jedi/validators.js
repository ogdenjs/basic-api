const schemaValidator = require('utils/validation/schemaValidator')
const patchValidation = require('utils/patch/patchValidation')

module.exports = {
  urlId,
  postJedi,
  putJedi,
  patchJedi
}

function urlId(req, res, next){
  req.checkParams('id', 'Invalid Id').isAlphanumeric()
  const errors = req.validationErrors()

  if(errors){
    return next({type: 'validation', error: errors})
  }
  return next()
}

function postJedi(req, res, next){
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
  const valid = schemaValidator.validate(req.body, schema, (err) => {
    return next({type: 'validation', error: err})
  })
  if(valid){
    return next()
  }
}

function putJedi(req,res, next){

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

  //check valid id in url
  req.checkParams('id', 'Invalid Id').isAlphanumeric()
  const errors = req.validationErrors()

  if(errors){
    return next({type: 'validation', error: errors})
  }

  //check valid body
  const valid = schemaValidator.validate(req.body, schema, (err) => {
    return next({type: 'validation', error: err})
  })

  if(valid){
    return next()
  }
}

function patchJedi(req, res, next){

  //check valid id in url
  req.checkParams('id', 'Invalid Id').isAlphanumeric()
  const errors = req.validationErrors()

  if(errors){
    return next({type: 'validation', error: errors})
  }

  //validate patch request body
  const valid = patchValidation.validatePatchRequest(req.body, res)

  if(valid){
    return next()
  }
}
