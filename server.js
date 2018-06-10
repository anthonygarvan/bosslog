'use strict';

const http = require('http');
const getApp = require('./app');
const winston = require('winston');

getApp.then((app) => {
  const server = http.createServer(app);
  server.listen(process.env.PORT, () => winston.log('info', `Listening on port ${process.env.PORT}...`));
});
