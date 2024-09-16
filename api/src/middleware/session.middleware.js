const session = require('express-session')
const { env } = require('../config/meta')
const PgSession = require('connect-pg-simple')(session)

const sessionLength = 10 /* days */ * 24 /* h */ * 60 /* m */ * 60 /* s */ * 1000 /* ms */

const publicCookie = ({ path = '/', secure = false, _expires }) => ({
    path, secure,
    httpOnly: false,
    expires: _expires
})

module.exports = [
    session({
        name: 'tt-sid',
        store: new PgSession({
            tableName: 'session',
            pool: require('../db/admin/connect').staticPool,
        }),
        secret: require('../config/dbServer.json').sessionSecret || 'SECRET',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: env !== 'development', httpOnly: true, maxAge: sessionLength },
    }),
    (req, res, next) => {
        if (req.sessionID) res.cookie('tt-session', 'exists', publicCookie(req.session.cookie))
        else res.cookie('tt-session', '', { secure: env !== 'development', httpOnly: true, maxAge: 0 })
        next()
    }
]
