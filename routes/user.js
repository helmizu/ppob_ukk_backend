const express = require('express');
const router = express.Router();
const passport = require('passport')
const mUser = require('../models/user')

router.get('/user/:id?', mUser.getUser);
router.post('/user', mUser.setUser);
router.put('/user/:id', mUser.updUser);
router.delete('/user/:id', mUser.delUser);

router.post('/login', mUser.login);
router.get('/logout', mUser.logout);
router.post('/register', mUser.setUser);
router.get('/current', passport.authenticate('jwt', {session : false }), (req, res) =>{
    res.json(req.user)
})

router.post('/set/cookie', (req, res) => {
    res.cookie("token", req.body.cookie, { expires: new Date(Date.now() + 900000), encode: String }).json({token : req.body.cookie})
})
module.exports = router;
