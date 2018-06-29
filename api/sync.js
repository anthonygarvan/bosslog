'use strict';

const winston = require('winston');
const app = require('express')();
const diff = require('deep-diff');

module.exports = { Sync: (db, auth) => {
  app.post('/', auth.ensureAuthenticated, (req, res) => {
    db.notes.find({ userId: req.user.id, revision: { $gte: parseInt(req.body.revision) } })
      .sort({ revision: 1 })
      .toArray((err, revisions) => {
          console.log(revisions);
          if( revisions.length > 0 ) {;
            res.send({ success: false, revisions })
          } else {
            db.notes.insert({ userId: req.user.id,
                revision: parseInt(req.body.revision),
                encryptedDiff: req.body.encryptedDiff });
            res.send({ success: true })
          }
    });
  });

  return app;
  }
}
