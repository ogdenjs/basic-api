module.exports = (req, res, next) => {

  req.db.jedi.find({}).sort({ name: 1 }).skip(0).limit(3).exec((err, records) => {
    if (err){ return next({error: err}) }
    return res.json(records)
  })

}
