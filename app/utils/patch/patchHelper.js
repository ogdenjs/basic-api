var jsonpatch = require('fast-json-patch')
var patchValidation = require('./patchValidation')
var schemaValidator = require('utils/validation/schemaValidator')

module.exports = {
  handlePatch
}

/**
 * Validates the model changes of a patch request and saves it to the model specified based on the id given
 * (the actualy request body is validated outside this function in the validator middleware for the route using
 * `patchValidation.validatePatchRequest()` - the validation happening here is done after modifying the document)
 * @param  {object} Model       The Mongoose Model
 * @param  {string} id          The id of the document to save
 * @param  {array} patchRequest The json patch request body (array of patches)
 * @param  {object} inputSchema The jsonschema input schema to compare the patched document agains
 * @param  {object} res         The express response object
 * @param  {function} cb        Callback function, if provided, this function won't send a response, instead it will call this with the savedDocument
 * @return {[type]}             [description]
 */
function handlePatch(Model, id, patchRequest, inputSchema, res, next, cb){
  var requestValid = true

  var modelPromise = Model.findOne({ _id: id }, (err, myDocument) => {
    if (err) return next({error: err})

    if(!myDocument){
      return res.status(204).json({})
    }

    //patch a copy of a our document (mongo's doc object is in many ways uneditable)
    var patchedDoc = JSON.parse(JSON.stringify(myDocument))
    jsonpatch.apply(patchedDoc, patchRequest)

    //check that the patch is compatable with the document
    requestValid = patchValidation.validateAgainstDocument(patchRequest, myDocument, patchedDoc, res)

    //Run schema validation with the resulting patchedDoc
    if(requestValid){
      //validate the patched document based on schema
      const patchedDocCopy = JSON.parse(JSON.stringify(patchedDoc))//make copy before validation so metadata fields aren't stripped
      requestValid = schemaValidator.validate(patchedDocCopy, inputSchema, function(err){
        return next({type: 'validation', error: err})
      })
    }

    if(requestValid){

      //construct jsonpatch mongodb update object
      //We COULD just use the patchedDoc object, which works great for only replace or add.
      //However, for "removes" we need to use the $unset command
      let unsetObject = { '$unset': {} }
      let hasUnsets = false
      patchRequest.map((myPatch) => {
        if(myPatch.op === 'remove'){
          let refPath = myPatch.path.replace(/\//g, '.')
          //remove initial dot
          refPath = refPath.replace(/^(\.)/, '')
          unsetObject['$unset'][refPath] = ''
          hasUnsets = true
        }
      })
      //only add to update object if there are any unsets
      if(hasUnsets){
        //I think this only works of patching something at the top-level of a record
        //The other option is to change the value on the client, then do a put
        Object.assign(patchedDoc, unsetObject)
      }

      //if there's a _updated value, remove it from patchedDoc
      if(patchedDoc._updated){
        delete patchedDoc._updated
      }

      // Run findbyidandupdate to update the document with the patched doc that comes out of the schema validation above
      Model.update({_id: id}, patchedDoc, {returnUpdatedDocs: true}, (err, numAffected, savedDocument) => {
        if (err) return next({error: err})
        if(cb){
          cb(savedDocument)
        }
        else{
          return res.json(savedDocument)
        }
      })


    }

  })

}
