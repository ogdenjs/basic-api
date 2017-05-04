const express = require('express')
const bodyParser = require('body-parser')

var path = require('path')
require('app-module-path').addPath(path.resolve(__dirname))//make requires relative to app dir

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static('public'))

app.post('/sum', (req, res, next) => {
  const sum = req.body.num1 + req.body.num2

  if (sum < 0) {
    return next({
      status: 400,
      message: 'Cant be below zero'
    })
  }

  res.json({ sum: sum })
})

app.get('/', (req, res) => {
  res.json('Where do you want to go?')
})
app.get('/health', function (req, res) {
  res.status(200).json('App is running and healthy.')
})
app.get('/error/:throw?', (req, res, next) => {
  if(req.params.throw){
    app.fjdkslfjdksl()
  }
  const err = {status: 500, message: 'This is an intended error'}
  next(err)
})

// send 404 on to error handlers in case we want to catch log or anything
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  if (err.status >= 500) {
    console.error(err)
    res.status(500).json({ message: err.message || 'Error!' })
  } else {
    res.status(err.status).json(err)
  }
})

app.listen(process.env.PORT || 8000, (err) => {
  if (err) {
    console.log('Error:', err)
  }

  console.log('Server started at http://localhost:8000')
})
