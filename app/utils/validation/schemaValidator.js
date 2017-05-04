const ajv = require('ajv')({
  removeAdditional: 'all',
  coerceTypes: true,
  format: 'full',
  allErrors: true
})

module.exports = {
  validate
}


/**
 * Custom Validators
 */

/**
 * notEmpty validator
 * Checks to make sure that a string is not empty
 */
ajv.addKeyword('notEmpty', {
  type: 'string',
  validate: (schema, data) => {
    if(data === ''){
      return false
    }
    else{
      return true
    }
  },
  errors: false
})

/**
 * isPhone validator keyword
 * Checks to make sure the phone number passed in has between 8 and 16, and only numbers
 * Any international phone number should work with this
 */
ajv.addKeyword('isPhone', { type: 'string', validate: (schema, data) => {
  if(!data){
    return true
  }
  return data.match(/^\+*\d{8,16}$/)
}})

/**
 * Validate an object against some schema
 * @param  {object} myObject      The object to compare (usually req.body)
 * @param  {object} schema        The json schema
 * @param  {function} errorCallback The callback function when an error happens. Executes with errors as param.
 * @return {boolean}               True if passed, false if no.
 */
function validate(myObject, schema, errorCallback){
  //validate the document based on schema
  var valid = ajv.validate(schema, myObject)
  if (!valid){
    let errors = ajv.errors.map(function(error){
      return {
        param: error.dataPath,
        message: error.message,
        error: error
      }
    })
    errorCallback(errors)
    return false
  }
  else {
    return true
  }

}
