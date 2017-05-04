const userHasPermission = require('./userHasPermission')

/**
 * Route middleware that checks the tokenized user against permissions required.
 * This middleware only works if req.orgId exists (via other route middleware, usually in validation middlewares)
 * @param  {string | Array} permissions Permission(s) needed to authorize. Either a simple string or an array of permission strings (see ./permissions.js)
 * @example router.post('/', validators.postUser, authParamOrg, checkPermissions('users_save'), postUser)
 */
module.exports = function(permissions) {
  return (req, res, next) => {

    //here, if you had user management, you check and see if the user has permission(s) passed in
    if(userHasPermission(req.user, permissions)){
      return next()
    }
    return res.status(403).send({code: 'permissions', msg: 'You are not authorized to do that.'})

  }
}
