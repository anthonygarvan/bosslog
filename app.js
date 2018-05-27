'use strict';

const express = require('express');
const compression = require('compression');
const { Contact } = require('./api/contact');
const path = require('path');
const urlEncodedBodyParser = require('body-parser').urlencoded({ extended: true, limit: '1mb' });
const jsonBodyParser = require('body-parser').json();
const ReactViews = require('express-react-views');
const critical = require('critical');
const morgan = require('morgan');


const app = express();
const contact = Contact();
app.use(compression(), express.static('public', { extensions: ['html'] }));
app.use(urlEncodedBodyParser);
app.use(jsonBodyParser);
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'));
app.set('views', path.join(__dirname, '/web'));
app.set('view engine', 'js');
app.engine('js', ReactViews.createEngine());


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

app.render('pages/About', (err, html) => {
  critical.generate({
    html,
    css: 'public/css/master.css',
    dest: 'public/about.html',
    minify: true,
    inline: true,
    folder: 'public',
  });
});

app.render('pages/Contact', (err, html) => {
  critical.generate({
    html,
    dest: 'public/contact.html',
    css: 'public/css/master.css',
    minify: true,
    inline: true,
    folder: 'public',
  });
});

app.use('/contact', contact);

module.exports =  app;
