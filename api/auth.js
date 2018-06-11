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

          res.redirect(req.session.path || '/');
          const userSession = req.session;
          delete userSession.path;
          delete userSession.query;
  });

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
