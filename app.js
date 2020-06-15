if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();

const { hash, compare } = require('bcrypt')
// const {passport, session} = require('./authen-author.js')

const { mongoose, ...Models } = require('./mongoose-connection.js');
const controller = require('./controller.js').config(Models, { hash, compare })

app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use(session())
// app.use(passport.initialize())
// app.use(passport.session())
app.use('/public', express.static(`${__dirname}/public`))
app.use(controller)

app.listen(process.env.PORT, () => {
    console.log(`serving on ${process.env.PORT}`);
})