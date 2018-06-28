'use strict';

const express = require('express');
const compression = require('compression');
const path = require('path');
const urlEncodedBodyParser = require('body-parser').urlencoded({ extended: true, limit: '10mb' });
const jsonBodyParser = require('body-parser').json();
const ReactViews = require('express-react-views');
const critical = require('critical');
const morgan = require('morgan');
const getDb = require('./api/db').getDb;
const Auth = require('./api/auth').Auth;
const Sync = require('./api/sync').Sync;
const diff = require('deep-diff');
const swPrecache = require('sw-precache');

module.exports = getDb.then((db) => {
  const app = express();
  const auth = Auth(db);
  const sync = Sync(db, auth);

  app.use(compression(), express.static('public', { extensions: ['html'] }));
  app.use(urlEncodedBodyParser);
  app.use(jsonBodyParser);
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'));
  app.set('views', path.join(__dirname, '/web'));
  app.set('view engine', 'js');
  app.engine('js', ReactViews.createEngine());

  app.use(auth.session);
  app.use(auth.passport.initialize());
  app.use(auth.passport.session());

  app.use('/auth', auth.app);
  app.use('/sync', sync);


  app.render('pages/Index', (err, html) => {
    console.log(err);
    critical.generate({
      html,
      css: 'public/css/master.css',
      dest: 'public/index.html',
      minify: true,
      inline: true,
      folder: 'public',
    });
  });

  swPrecache.write(`public/service-worker.js`, {
    staticFileGlobs: ['public/*/*.{js,html,css,png}', 'public/index.html'],
    stripPrefix: 'public'
  }, () => {
    console.log('service worker written');
  });

  return app;
});
