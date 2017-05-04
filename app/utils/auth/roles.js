const permissions = require('./permissions')

/**
 * This module defines what permissions are required for each role.
 * All hard-coded, since roles aren't dynamic
 * @type {Object}
 */
module.exports = {
  ADMIN: [
    permissions.jedi.view,
    permissions.jedi.save,
    permissions.jedi.delete,
  ],
  SOMETHING_ELSE: [
    permissions.jedi.view,
  ]
}
