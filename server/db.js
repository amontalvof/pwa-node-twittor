const Datastore = require('nedb');
const database = new Datastore('subs.db');

module.exports = database;
