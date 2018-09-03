'use strict';

const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

module.exports = { Auth: (db) => {
  const app = express();

  const session = expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ db, autoRemove: 'interval' }),
  });

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.ROOT_URL}/auth/google/callback`,
    passReqToCallback: true,
  },
    (request, accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }));

  app.get('/google', passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'],
  }));

  app.get('/google/callback',
    passport.authenticate('google'),
      (req, res) => {
          db.users.findOne({ email: req.user.email }, (err, userFound) => {
            if (!userFound) {
              let photoUrl = '';
              if (req.user.photos.length > 0) { photoUrl = req.user.photos[0].value; }
              const user = { id: req.user.id,
                displayName: req.user.displayName,
                email: req.user.email,
                photoUrl,
                signUpDate: new Date()};
              db.users.update({ email: user.email }, user, { upsert: true });
            }
          res.redirect(req.session.path || '/');
          const userSession = req.session;
          delete userSession.path;
          delete userSession.query;
  })});

  function ensureAuthenticated(req, res, next) {
    const userSession = req.session;
    userSession.path = req.originalUrl;
    userSession.query = req.query;

    if (req.isAuthenticated()) {
      next();
    } else { res.redirect('/auth/google'); }
  }


  app.get('/authenticate', ensureAuthenticated, (req, res) => {
    res.redirect('/?loggingIn=true');
  });

  app.get('/is-authenticated', (req, res) => {
    if (req.isAuthenticated()) {
      res.send({ isAuthenticated: true, userEmail: req.user.email })
    } else {
        res.send({ isAuthenticated: false });
    }
  });

  app.get('/pay-prompt', ensureAuthenticated, (req, res) => {
    db.users.findOne({ email: req.user.email }, (err, userFound) => {
      const pastTrialPeriod = (new Date() - new Date(userFound.signUpDate)) > 30*24*60*60*1000;
      const hasntPaid = !userFound.lastPaymentDate;
      const paymentDue = (new Date() - new Date(userFound.lastPaymentDate)) > 365*24*60*60*1000;
      const promptUser = pastTrialPeriod && (hasntPaid || paymentDue);
      res.send({ promptUser });
    });
  });

  app.get('/payment-complete', ensureAuthenticated, (req, res) => {
    db.users.findOne({ email: req.user.email }, (err, userFound) => {
      userFound.lastPaymentDate = new Date();
      db.users.update({ _id: userFound._id}, userFound);
      res.send({ success: true });
    });
  })

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/login', (req, res) => {
    res.send('login');
  });

  return { app,
    ensureAuthenticated,
    session,
    passport };
} };
