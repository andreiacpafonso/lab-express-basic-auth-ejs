const express = require('express');
const User = require("../models/User.model");

// iniciate the router
const router = express.Router();


// GET route to display the signup form
router.get("/signup", (req, res, next) => {
    res.render("auth/signup", { isConnected: false})
});

// POST route to process the form
router.post("/signup", async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        res.redirect('/auth/login');
    } catch (error) {
        console.log(error.message)
        res.render('auth/signup', { errorMessage: error.message, isConnected: false })
    }
});

// GET login page
router.get("/login", (req, res) => {
    res.render("auth/login", { isConnected: false })
});

// POST Login data
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
        res.render("auth/login", { errorMessage: "Email is not registered. Try with other email.", isConnected: false });
    } else {
        if (bcrypt.compareSync(password, currentUser.password)) {
            console.log('Correct password')
            req.session.user = currentUser
            res.redirect('/profile')
        } else {
            res.render('auth/login', { errorMessage: 'Incorrect password', isConnected: false })

        }
    }
});

// GET logout
router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            next(err);
        }
        res.redirect('/auth/login')
    })
})


module.exports = router;
