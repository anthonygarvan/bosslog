'use strict';

const winston = require('winston');
const app = require('express')();
const diff = require('deep-diff');

module.exports = { Sync: (db, auth) => {
  app.post('/', auth.ensureAuthenticated, (req, res) => {
    db.notes.findOne({ userId: req.user.id }, (err, note) => {
      if( !note ) {
        note = { userId: req.user.id, bigNote: {}, revision: 0 };

        req.body.diff.forEach(change => {
            diff.applyChange(note.bigNote, null, change);
        });
      }

      const proposedRevision = parseInt(req.body.revision);
      const oldRevision = note.revision;

      note.revision += 1;
      if (proposedRevision === (oldRevision + 1)) {
        req.body.diff.forEach(change => {
            diff.applyChange(note.bigNote, null, change);
        });

        if(!note.bigNote.contentState.entityMap) {
          note.bigNote.contentState.entityMap = {};
        }

        res.send({ success: true });
      } else {
        res.send({ success: false, bigNote: note.bigNote, revision: note.revision });
      }

      db.notes.update({ userId: req.user.id }, note, { upsert: true })
    });
  });

  return app;
  }
}
