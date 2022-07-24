//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs")
const mongoose = require("mongoose");

// const encrypt = require("mongoose-encryption")
// const md5 = require('md5');
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
console.log(process.env.API_KEY);
// console.log(md5("123456"));

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));


app.use(session({
    secret: 'Our little secret.', resave: false, saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});


const userSchema = new mongoose.Schema({
    email: String, password: String
});

userSchema.plugin(passportLocalMongoose);

// const secret = "Thisisourlittlesecret";

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});


app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login")
    }
});
app.post("/register", function (req, res) {

    // bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    //     const newUser = new User({
    //         email: req.body.username,
    //         // password: md5(req.body.password)
    //         password: hash
    //     });
    //
    //     newUser.save(function (err) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             res.render("secrets");
    //         }
    //     });
    // });

    User.register({username: req.body.username}, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", function (req, res) {

    //     const username = req.body.username;
//     // const password = md5(req.body.password);
//     const password = req.body.password;
//
//
//     User.findOne({email: username}, function (err, foundUser) {
//         if (err) {
//             console.log(err);
//         } else {
//             if (foundUser) {
//                 //     if(foundUser.password === password) {
//                 //     res.render("secrets");
//                 // }
//
//                 bcrypt.compare(password, foundUser.password, function (err, result) {
//
//                     if (result === true) {
//                         res.render("secrets");
//                     }
//                 });
//             }
//         }
//     });

    const user = new User({
        username: req.body.username, password: req.body.password
    })

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            })
        }
    });
});

app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
        }
    });
    res.redirect("/");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
//session- a lot of time where the user interacts with a server

//bcrypt or md5 or encrypte mongoose or without any