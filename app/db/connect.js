const Datastore = require('nedb')

module.exports = (req, res, next) => {
  let db = {}
  db.jedi = new Datastore({ filename: 'database/jedi.db', autoload: true })
  db.jedi.loadDatabase()
  req.db = db
  next()
}
