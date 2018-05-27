'use strict';

const http = require('http');
const app = require('./app');
const winston = require('winston');

const server = http.createServer(app);
server.listen(process.env.PORT, () => winston.log('info', `Listening on port ${process.env.PORT}...`));
