module.exports = function (req, res, next){

  req.db.jedi.remove({_id: req.params.id}, err => {
    if (err) return next({error: err})
    return res.json('success')
  })

}
