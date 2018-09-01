'use strict';


const { MongoClient } = require('mongodb');
const winston = require('winston');

module.exports = {
  getDb: MongoClient.connect(process.env.MONGO_URI)
    .then((client) => {
      const db = client.db('bosslog');
      db.notes = db.collection('notes');
      return new Promise(resolve => resolve(db));
    }).then(db =>
      Promise.all([
        db.notes.createIndex({ userId: 1 }),
        db.notes.createIndex({ revision: 1 })
      ]).catch(err => winston.log(err))
        .then(() => new Promise((resolve) => { resolve(db); }))),
};
