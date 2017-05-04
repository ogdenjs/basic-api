module.exports = (req, res, next) => {

  req.db.jedi.findOne({_id: req.params.id}).exec((err, record) => {
    if (err){ return next({error: err}) }
    return res.json(record)
  })

}
