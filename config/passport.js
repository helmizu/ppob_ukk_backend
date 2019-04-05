const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const keys = require('../config').secretOrKey
const db = require('../config').db
const opts = {}

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) token = req.cookies['token'];
    return token;
};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys;

module.exports = (passport) => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        if (jwt_payload.id_level) {
            db.query(`SELECT * FROM admin WHERE username = '${jwt_payload.username}' AND password = '${jwt_payload.password}' LIMIT 1`,
            function(err, admin, fields){
                const payload = {
                    id_admin: admin[0].id_admin,
                    id_level: admin[0].id_level,
                    nama_admin: admin[0].nama_admin,
                }
                if (err) return done(err, null)
                return done(null, payload)
            }) 
        } else {
            db.query(`SELECT * FROM pelanggan WHERE username = '${jwt_payload.username}' AND password = '${jwt_payload.password}' LIMIT 1`,
            function(err, user, fields){
                const payload = {
                    id_pelanggan: user[0].id_pelanggan,
                    no_meter: user[0].no_meter,
                    nama: user[0].nama,
                    alamat: user[0].alamat,
                    id_tarif: user[0].id_tarif,
                }
                if (err) return done(err, null)
                return done(null, payload)
            })        
        } 
    }))
}
