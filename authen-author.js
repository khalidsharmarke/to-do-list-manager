const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const seession = require('express-session')

function authenticateUser(username, password, done){
	db.User
		.findOne({username: username})
		.exec()
		.then(user => { 
			if (!user) return done(null, false, {message: 'No user found by that username'})

			encrypt.compare(password, user.password)
				.then(result => {
					if (!result) return done(null, false, {message: 'incorrect password'})
					else return done(null, user)
				})
				.catch(err => done(err, false, {message: 'something went wrong with DB comparison'}))

		})
		.catch(err => done(err, false, {message: 'something went wrong with DB query'}))
}

passport.use(new LocalStrategy(authenticateUser))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => done(null, getUserById(id)))

module.exports = {
	passport: passport,
	session: session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false
	})
}