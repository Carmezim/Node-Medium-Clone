const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

// Schema setup
const UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, ' is invalid'], index: true},
	email: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\s+@\S+\.\S+/, 'is invalid'], index: true},
	bio: String,
	image: String,
	hash: String,
	salt: String
}, {timestamps: true});


// Hashes and salt
UserSchema.methods.setPassword = (password) => {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// Password validation
UserSchema.methods.validPassword = (password) => {
	const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
	return this.hash === hash;
};

// Generating JWT
UserSchema.methods.generateJWT = () => {
	const today = new Date();
	let exp = new Date(today);
	exp.setDate(today.getDate() + 60);

	return jwt.sign({
		id: this._id,
		username: this.username,
		exp: parseInt(exp.getTime() / 1000),
	}, secret);
};

// Generating JSON auth
UserSchema.methods.toAuthJSON = () => ({
	username: this.username,
	email: this.email,
	token: this.generateJWT()
});

UserSchema.methods.toProfileJSONfor = function (user) {
	return {
		username: this.username,
		bio: this.bio,
		image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
		following: false
	};
};

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('user', UserSchema);