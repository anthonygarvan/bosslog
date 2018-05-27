'use strict';

const winston = require('winston');
const SendInBlue = require('sendinblue-api');
const app = require('express')();
const path = require('path');

app.set('views', path.resolve(__dirname, '../web'));
app.set('view engine', 'js');
app.engine('js', require('express-react-views').createEngine());


const parameters = { apiKey: process.env.SEND_IN_BLUE_API_KEY, timeout: 5000 };
const sendin = new SendInBlue(parameters);

module.exports = {
  Contact: () => {
    app.post('/', (req, res) => {
      res.render('pages/ContactEmail', req.body, (renderErr, emailHtml) => {
        const toObj = {};
        toObj['info@simplypro.digital'] = 'info@simplypro.digital';
        const params = {
          to: toObj,
          from: [req.body.email, req.body.name],
          html: emailHtml,
          subject: 'Someone has reached out to Simply Pro!',
          replyTo: [req.body.email, req.body.email],
        };

        sendin.send_email(params, (emailErr, emailResult) => {
          if (emailErr || emailResult.code !== 'success') {
            winston.log('error', emailErr);
            winston.log('error', emailResult);
            winston.log('error', renderErr);
            winston.log('error', req.body);
            res.send(400);
          } else {
            res.send({ success: true });
          }
        });
      });
    });

    return app;
  },
};
