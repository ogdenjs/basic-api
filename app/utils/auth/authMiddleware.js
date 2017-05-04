/**
 * this is where you might get a token from the header and validate it.
 * You could also save the found user object to the request for use in other middleware
 */
module.exports = (req, res, next) => {

  //right now, we're just going to see if there is a token in the header, and call it good
  let token
  if(req.headers.authorization){
    token = req.headers.authorization.split(' ')[1]//get the part after 'Bearer '
  }

  if(!token){
    return res.status(401).send({ success: false, message: 'No token provided' })
  }

  //here you could validate the token, we'll skip to mocking a user
  const user = {
    _id: 'abc12345678',
    name: 'George Lucas',
    role: 'ADMIN'
  }
  //add user to the req object
  req.user = user

  return next()

}
