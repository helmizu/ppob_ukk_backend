const db = require('../config').db
const keys = require('../config').secretOrKey
const jwt = require('jsonwebtoken')
const userFunc = {
    getUser : (req, res) => {
        var limit = req.query.limit || 10
        var offset = req.query.offset || 0
        if (req.params.id) {
            db.query(`SELECT * FROM pelanggan JOIN tarif ON tarif.id_tarif = pelanggan.id_tarif WHERE id_pelanggan = ${req.params.id}`,
            function (error, results, fields) {
                if (error) throw error;
                res.status(200).json(results[0])
            })     
        } else {
            if (req.query.limit) {
                db.query(`SELECT * FROM pelanggan JOIN tarif ON tarif.id_tarif = pelanggan.id_tarif ORDER BY pelanggan.nama ASC LIMIT ${limit} OFFSET ${offset}`,
                function (error, results, fields) {
                    if (error) throw error;
                    res.status(200).json(results)
                })
            } else {
                db.query(`SELECT * FROM pelanggan JOIN tarif ON tarif.id_tarif = pelanggan.id_tarif ORDER BY nama ASC`,
                function (error, results, fields) {
                    if (error) throw error;
                    res.status(200).json(results)
                }) 
            }
        }
    },
    setUser : (req, res) => {
        var data = {
            nama : req.body.nama,
            no_meter : req.body.no_meter,
            alamat : req.body.alamat,
            id_tarif : req.body.id_tarif,
            username : req.body.username,
            password : req.body.password
        }
        db.query(`SELECT * FROM pelanggan WHERE username = '${data.username}'`,
        function(error, user, fields) {
            if (error) throw error;
            user.length > 0 ? 
            res.status(400).json({msg : "username telah terdaftar"}) 
            :
            db.query('INSERT INTO pelanggan SET ?', data,
            function(error, results, fields){
                if (error) throw error;
                res.status(201).json(results)
            })        
        })
    },
    updUser : (req, res) => {
        var data = {
            nama : req.body.nama,
            no_meter : req.body.no_meter,
            alamat : req.body.alamat,
            id_tarif : req.body.id_tarif,
            username : req.body.username,
            password : req.body.password
        }
        db.query(`UPDATE pelanggan 
        SET no_meter=${data.no_meter},nama='${data.nama}',alamat='${data.alamat}',id_tarif=${data.id_tarif},username='${data.username}',password='${data.password}' 
        WHERE id_pelanggan=${req.params.id}`,
        function (error, results, fields) {
            if (error) throw error;
            res.status(200).json(results)
        })
    },
    delUser : (req, res) => {
        db.query(`DELETE FROM pelanggan WHERE id_pelanggan=${req.params.id}`,
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            res.status(200).json(results)
        })
    },
    // Auth
    login : (req, res) => {
        var data = {
            username : req.body.username,
            password : req.body.password
        }
        
        db.query(`SELECT * FROM admin WHERE username = '${data.username}' AND password = '${data.password}' LIMIT 1`,
        function(error, admin, fields) {
            if (error) throw error;
            if (admin.length > 0) {
                const payload = {
                    id_admin: admin[0].id_admin,
                    id_level: admin[0].id_level,
                    nama_admin: admin[0].nama_admin,
                    username: admin[0].username,
                    password: admin[0].password  
                }
                jwt.sign(payload, keys, {expiresIn: "1d"}, (err, token) => {
                    if (err) return res.status(500).json({err : "generate token error"})
                    return res.status(200).cookie('token', token, { expires: new Date(Date.now() + 900000), encode: String }).json({
                        signedin : true,
                        token: "Bearer " + token
                    })
                })
            } else {   
                db.query(`SELECT * FROM pelanggan WHERE username = '${data.username}' AND password = '${data.password}' LIMIT 1`,
                function(error, user, fields) {
                    if (error) throw error;
                    if (user.length > 0) {
                        const payload = {
                            id_pelanggan: user[0].id_pelanggan,
                            no_meter: user[0].no_meter,
                            nama: user[0].nama,
                            alamat: user[0].alamat,
                            id_tarif: user[0].id_tarif,
                            username: user[0].username,
                            password: user[0].password  
                        }
                        jwt.sign(payload, keys, {expiresIn: "1d"}, (err, token) => {
                            if (err) return res.status(500).json({err : "generate token error"})
                            return res.status(200).cookie('token', token, { expires: new Date(Date.now() + 900000), encode: String }).json({
                                signedin : true,
                                token: "Bearer " + token
                            })
                        })
                    } else {   
                        res.status(400).json({msg : "username atau password salah"})
                    }
                })
            }
        })
    },
    logout : (req, res) => {
        res.status(200).clearCookie('token').json({signedin : false})
    }
}

module.exports = userFunc