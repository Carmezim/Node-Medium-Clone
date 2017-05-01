const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');

// schema setup
const UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, ' is invalid'], index: true},
  email: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\s+@\S+\.\S+/, 'is invalid'], index: true},
  bio: String,
  image: String,
  hash: String,
  salt: String
}, {timestamps: true});

// unique validation
UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

// Hashes and salt
UserSchema.methods.setPassword = password => {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

mongoose.model('user', UserSchema);