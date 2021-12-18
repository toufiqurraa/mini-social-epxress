const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const sanitizeHTML = require('sanitize-html')

const app = express()

let sessionOptions = session({
  secret: 'javascript should be the first love',
  store: new MongoStore({ client: require('./db') }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 3, httpOnly: true }
})

app.use(sessionOptions)
app.use(flash())

// this function is going to run for every request
app.use((req, res, next) => {
  // make markdown function available for ejs template
  res.locals.userMarkdown = content => sanitizeHTML(markdown(content), { allowedTags: ['p', 'br', 'ul', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {} })

  // make all error and success flash messages available for all templates
  res.locals.errors = req.flash('errors')
  res.locals.success = req.flash('success')

  // make current user id available on the req object
  if (req.session.user) req.visitorId = req.session.user._id
  else req.visitorId = 0

  res.locals.user = req.session.user // this object will be available within our ejs template

  next()
})

const router = require('./router')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(express.static('public'))
app.set('views', 'views') // express is going to look for the folder defined as second argument for view

app.set('view engine', 'ejs')

// app.get('/', (req, res) => res.render('home-guest'))
app.use('/', router)

module.exports = app