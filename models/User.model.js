'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const ObjectId = mongoose.Schema.Types.ObjectId; //permet de creer un champ qui sera un d'objectId de custommer par exemple
const userSchema = new mongoose.Schema({
    name: String,
    userid: String,
    provider: String,
    email: String
});


//userSchema.statics.findOrCreate = require("find-or-create");

module.exports = mongoose.model('User', userSchema);
