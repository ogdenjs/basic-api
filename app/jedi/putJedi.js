module.exports = (req, res, next) => {

  req.db.jedi.update({_id: req.params.id}, req.body, {returnUpdatedDocs: true}, (err, numAffected, savedRecord) => {
    if (err) { return next({error: err}) }
    return res.json(savedRecord)
  })

}
