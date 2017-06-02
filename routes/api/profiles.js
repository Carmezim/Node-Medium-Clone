const router = require('exporess').Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const auth = require('../auth');

// Preload aticle objects on routes with '.username'
router.param('username', function (req, res, next, username) {
	User.findOne({ username: username }).then(function (user) {
		if (!user) { return res.sendStatus(404); }

		req,profile = user;

		return next();
	}).catch(next);
});

router.get('/:username', auth.optional, function (req, res, next) {
	if (req.payload) {
		User.findById(req.payload.id).then(function (user) {
			if (!user) { return res.json({profile: req.profile.toProfileJSONFor(false)}); }

			return res.json({profile: req.profile.toProfileJSONFor(user)});
		});
	} else {
		return res.json({profile: req.profile.toProfileJSONFor(false)});
	}
});

module.exports = router;