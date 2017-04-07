const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  const matched = req.url.match(/(.*)\.html$/)

  if (!matched) {
    req.url += '.html'
  }

  next()
})

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.json({ message: 'Hello world!' })
})

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

app.use((err, req, res, next) => {
  if (err.status >= 500) {
    console.log(err)
    res.status(500).json({ message: 'error!' })
  } else {
    res.status(err.status).json(err)
  }
})

app.listen(8000, (err) => {
  if (err) {
    console.log('Error:', err)
  }

  console.log('Server started')
})
