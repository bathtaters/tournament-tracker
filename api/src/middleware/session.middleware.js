const session = require('express-session')
const { env } = require('../config/meta')
const PgSession = require('connect-pg-simple')(session)
const sessionSecret = require('../config/dbServer.json').sessionSecret;
const { staticPool } = require('../db/admin/connect')

const sessionLength = 10 /* days */ * 24 /* h */ * 60 /* m */ * 60 /* s */ * 1000 /* ms */

const publicCookie = ({ path = '/', secure = false, _expires }) => ({
    path, secure,
    httpOnly: false,
    expires: _expires
})

module.exports = [
    session({
        name: 'tt-sid',
        proxy: true,
        store: new PgSession({
            tableName: 'session',
            pool: staticPool(),
        }),
        secret: sessionSecret || 'SECRET',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: env !== 'development', httpOnly: true, maxAge: sessionLength },
    }),
    (req, res, next) => {
        // Set the public-facing cookie
        if (req.sessionID) res.cookie('tt-session', 'exists', publicCookie(req.session.cookie))
        else res.cookie('tt-session', '', { secure: env !== 'development', httpOnly: true, maxAge: 0 })
        next()
    }
]
