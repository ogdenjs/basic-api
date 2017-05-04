/* eslint eqeqeq: "off" */
const jsonpatch = require('fast-json-patch')
const ajv = require('ajv')({
  v5: true, //enable v5 features
  removeAdditional: 'all',
  coerceTypes: true,
  format: 'full',
  allErrors: true
})

module.exports = {
  validatePatchRequest,
  validateAgainstDocument
}

//Note to dev: make sure all 422 responses match the format utilizes in utils/errors/validationErrorMiddleware.js

/**
 * Validate the http PATCH request body. Sends express error response if fails
 * @param  {array} patchRequest The json patch array from request body
 * @param  {object} res         Express response object we can use to call send
 * @return {boolean}            True if it's valid, false if not
 */
function validatePatchRequest(patchRequest, res){

  const jsonPatchSchema = {
    type: 'array',
    items: {
      type: 'object',
      oneOf: [
        {
          title: 'Replace and Add',
          type: 'object',
          properties: {
            op: { type: 'string', enum: ['replace', 'add'] },
            path: { type: 'string' },
            value: { type: ['string', 'object', 'array'] }
          },
          required: ['op', 'path', 'value']
        },
        {
          title: 'Remove',
          type: 'object',
          properties: {
            op: { type: 'string', enum: ['remove'] },
            path: { type: 'string' },
            value: { type: 'string' }
          },
          required: ['op', 'path']
        }
      ]
    }
  }

  //validate the body against our schema
  const patchValid = ajv.validate(jsonPatchSchema, patchRequest)
  if (!patchValid){
    let errors = ajv.errors.map(function(error){
      return {
        param: error.dataPath,
        msg: error.message,
        info: error
      }
    })
    res.status(422).json(errors)
    return false
  }
  else{
    return true
  }

}

/**
 * Using a database document, validate our request against it
 * @param  {array} patchRequest      json patch array from request body
 * @param  {object} dbDocument      document that is to be patched (from the db)
 * @param  {object} patchedDocument a "pre-patched" version of the original document
 * @param  {object} res             Express response object we can use to call send
 * @return {boolean}                True if passed, false if failed comparison
 */
function validateAgainstDocument(patchRequest, dbDocument, patchedDocument, res){
  //make sure request is compatible with document
  var isValid = testAgainstDocument(patchRequest, dbDocument, res)

  if(isValid){
    //compare changes to make sure resulting patch is equal to the patch request
    isValid = compareChanges(patchRequest, dbDocument, patchedDocument, res)
  }

  return isValid
}

/**
 * Validate the patch request against the document to make sure it is compatible
 * @param  {array} patchRequest json patch array from request body
 * @param  {object} document    document record usually from database
 * @param  {object} res         Express response object we can use to call send
 * @return {boolean}            True if it's valid, false if not
 */
function testAgainstDocument(patchRequest, dbDocument, res) {
  const patchErrors = jsonpatch.validate(patchRequest, dbDocument)
  if(patchErrors){
    res.status(422).json({
      msg: patchErrors.message
    })
    return false
  }
  else{
    return true
  }
}

/**
 * Compare patch request with the resulting changes from patching the document. Return false if fails.
 * @param  {array} patchRequest      json patch array from request body
 * @param  {object} dbDocument      document that is to be patched (from the db)
 * @param  {object} patchedDocument a "pre-patched" version of the original document
 * @param  {object} res             Express response object we can use to call send
 * @return {boolean}                True if passed, false if failed comparison
 */
function compareChanges(patchRequest, dbDocument, patchedDocument, res){

  var valid = true

  //verify the changes to the document
  //only do this is the operation doesn't contain a push to the end of an array
  var isNotPushing = true
  patchRequest.map(function(singlePatch){
    if(singlePatch.path.indexOf('-') > -1){
      isNotPushing = false
    }
  })
  if(isNotPushing){
    //copy the dbDocument so we can get rid of mongoose and mongo properties
    var origDoc = JSON.parse(JSON.stringify(dbDocument))

    //run comparison
    var comparison = jsonpatch.compare(origDoc, patchedDocument)

    //loop through comparison patches, if one of them isn't in original request, error!
    var patchFieldsFailed = false
    comparison.map(function(compPatch){
      if(!bodyContainsPatch(patchRequest, compPatch)){
        patchFieldsFailed = true
        return true
      }
    })
    if(patchFieldsFailed){
      res.status(422).json({
        msg: 'Change to record is modifying too much.'
      })
      valid = false
    }
    else{
      valid = true
    }
  }
  return valid
}



/**
 * See if the patch object exists in the body array
 * @param  {array} body     A PATCH request body (jsonPatch)
 * @param  {object} patchObj A jsonPatch object
 * @return {boolean}         True if the patch obj is in the body
 */
function bodyContainsPatch(body, patchObj) {
  var i = body.length
  while (i--) {
    if (JSON.stringify(body[i]) == JSON.stringify(patchObj)) {
      return true
    }
  }
  return false
}
