module.exports = (req, res, next) => {

  const newJedi = req.body

  req.db.jedi.insert(newJedi, (err, newRecord) => {
    if (err) { return next({error: err}) }
    return res.json(newRecord)
  })

}
