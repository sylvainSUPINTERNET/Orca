const express = require('express');
const bodyParser = require('body-parser')
const session = require('express-session');

//Oauth2 passport
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

//db mongo 
const mongoose = require('mongoose');

//models
const User = require('./models/User.model');

const app = express();

//debugger
const morgan = require('morgan')
app.use(morgan('combined'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())


//template
// set the view engine to ejs
app.set('view engine', 'ejs');


//config mongoose + connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/orca')
  .then(() =>  console.log('connection mongo to Orca db successful'))
  .catch((err) => console.error(err));


  //config for auth via Github (when success, its stored automaticly into session)
  app.use(require('express-session')({
    secret: 'github only for elit ppl',
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

passport.use(new GitHubStrategy({
    clientID: '8a81d2b182813341e6c1',
    clientSecret: "dbf881ff3019fbd70caa01fa10d73a70a883e504",
    callbackURL: "http://localhost:8000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      console.log(profile)
       //check user table for anyone with a facebook ID of profile.id
       User.findOne({
        'userid': profile.id 
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        //No user was found... so create a new user with values from Facebook (all the profile. stuff)
        if (!user) {
            user = new User({
                name: profile.username,
                userid: profile.id,
                provider: 'github',
                email: "" //todo
             });

            user.save(function(err) {
                if (err) console.log(err);
                return done(err, user);
            });

        } else {
            //found user. Return
            return done(err, user);
        }
    });

  }));


app.get('/auth/github', passport.authenticate('github'));

  //passport.authentificate => sert a ouvrir 'autoriser l'app blabla' si fail redirect sur /login
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/successConnected', {user_infos: req.users, message:"Successfully connected !"});
  });


app.get('/', function(req,res,next){
    if(req.isAuthenticated()){
        res.render("home", {alert: "you are connected", login_path:"/login", user_infos: req.user, logout_path:"/logout"} )
    }else{
        res.render("home", {alert: "Please connect to use every functionalities !", login_path: "/login", logout_path:"/logout", user_infos: ""})
    }    
})

app.get('/login', function(req,res,next){
    res.render('login')
})

app.get('/logout', function(req, res) {
    req.session.destroy(function(e){ //destroy session create by passport Github 
        req.logout(); //give by passport to logout user
        res.redirect('/'); //redirect
    });
});

//return when connected successfully
app.get('/successConnected', function(req,res,next){
    //for access to user infos => req.user (access data save lors de l'inscription va github)
    //pour checker si il est connecté => req.isAuthentificated()
    if(req.isAuthenticated()){
       res.render('connection_success', {user_infos: req.users, message:"Successfully connected !"}) 
    }else{
       res.send('you are not connected, please login')
    }
})



let port = process.env.port || 8000;
app.listen(port, function(){
    console.log(`Application run on port ${port}`)
});


