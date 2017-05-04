const roles = require('./roles')

/**
 * Route middleware that checks the tokenized user against permissions required.
 * This middleware only works if req.orgId exists (via other route middleware, usually in validation middlewares)
 * @param  {string | Array} permissions Permission(s) needed to authorize. Either a simple string or an array of permission strings (see ./permissions.js)
 * @example router.post('/', validators.postUser, authParamOrg, checkPermissions('users_save'), postUser)
 */
module.exports = function(user, permissions) {

  if(!Array.isArray(permissions)){
    permissions = [permissions]
  }

  //loop through needed permissions, see if each exists in the permissions array for the role. If fails, error!
  let failedPermissions = false
  permissions.map((reqPermission) => {
    if(roles[user.role].indexOf(reqPermission) < 0){
      failedPermissions = true
    }
  })

  //if all permissions didn't pass
  if(failedPermissions){
    return false
  }
  else{
    return true
  }

}
